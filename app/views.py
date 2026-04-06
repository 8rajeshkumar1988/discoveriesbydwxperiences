from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import *
from participant.models import *
import json

from django.core.cache import cache


def index(request):
    class_type = request.GET.get("type")
    # resp=get_pardot_token()
    # print(salesforce_token())
    # update_links("app_sector", "description")
    class_list = [
        "first",
        "second",
        "third",
        "four",
        "five",
        "six",
        "seventh",
        "eighth",
        "ninth",
        "tenth",
    ]
    context = {}
    context = {
        "page_name": "home",
        "quiz_data": get_quiz_data(),
        "class_list": class_list,
        "class_type": class_type,
    }
    response = render(request, "front/index.html", context)
    if class_type:
        response.set_cookie("class_type", class_type, max_age=86400)

    return response


def get_quiz_data():
    quiz_data_cache_key = "quiz_data_cache"
    quiz_data_cache = cache.get(quiz_data_cache_key)
    if quiz_data_cache is not None:
        quiz_data = quiz_data_cache
    else:
        quiz_data = []
        quizzes = Quiz.objects.filter(is_active=True).order_by("sequence")
        for quiz in quizzes:
            options = Option.objects.filter(question=quiz).order_by("sequence")
            quiz_data.append(
                {
                    "id": quiz.id,
                    "question": quiz.question,
                    "sequence": quiz.sequence,
                    "options": options,  # you can also serialize if needed
                }
            )
        cache.set(quiz_data_cache_key, quiz_data, timeout=86400)

    return quiz_data


def get_ip_address(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


@csrf_exempt
def save_participant(request):
    if request.method == "POST":

        try:
            data = json.loads(request.body)
            name = data.get("name")
            class_type_post = data.get("class_type")
            location = data.get("location")
            if class_type_post:
                class_type = class_type_post
            else:
                class_type = request.COOKIES.get("class_type")
                if class_type is None:
                    class_type = ""

            if not name:
                return JsonResponse(
                    {"success": False, "error": "Name is required."}, status=400
                )
            
            if not location:
                return JsonResponse(
                    {"success": False, "error": "Location is required."}, status=400
                )

            participant = Participant.objects.create(
                name=name,location=location, class_type=class_type, ip_address=get_ip_address(request)
            )

            return JsonResponse(
                {
                    "success": True,
                    "message": "Participant saved.",
                    "participant_id": participant.id,
                }
            )
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    return JsonResponse(
        {"success": False, "error": "Invalid request method."}, status=405
    )


@csrf_exempt
def save_quiz_attempt(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            participant_id = data.get("participant_id")
            quiz_id = data.get("quiz_id")
            option_id = data.get("option_id")

            if not all([participant_id, quiz_id, option_id]):
                return JsonResponse(
                    {"success": False, "error": "Missing required fields."}, status=400
                )

            # Fetch related objects
            participant = Participant.objects.get(id=participant_id)
            quiz = Quiz.objects.get(id=quiz_id)
            option = Option.objects.get(id=option_id)

            # Create or ignore if duplicate due to unique_together
            attempt, created = QuizAttempt.objects.get_or_create(
                participant=participant, quiz=quiz, option=option
            )

            return JsonResponse(
                {
                    "success": True,
                    "message": (
                        "Quiz attempt saved."
                        if created
                        else "Quiz attempt already exists."
                    ),
                    "attempt_id": attempt.id,
                }
            )
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)
    return JsonResponse(
        {"success": False, "error": "Invalid request method."}, status=405
    )


@csrf_exempt
def save_participant_result(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            participant_id = data.get("participant_id")
            option = data.get("option")
            card_name = data.get("card_name")
            is_downloaded = data.get("is_downloaded")
            is_shared = data.get("is_shared")

            if not all([participant_id, option, card_name]):
                return JsonResponse(
                    {"success": False, "error": "Missing required fields."}, status=400
                )

            participant = Participant.objects.get(id=participant_id)

            # Try to get existing result
            result, created = ParticipantResult.objects.get_or_create(
                participant=participant,
                option=option,
                card_name=card_name,
                defaults={
                    "is_downloaded": (
                        is_downloaded if is_downloaded is not None else False
                    ),
                    "is_shared": is_shared if is_shared is not None else False,
                },
            )

            # If already exists, update flags
            updated = False
            if not created:
                if is_downloaded is not None:
                    result.is_downloaded = is_downloaded
                    updated = True
                if is_shared is not None:
                    result.is_shared = is_shared
                    updated = True
                if updated:
                    result.save()

            return JsonResponse(
                {
                    "success": True,
                    "message": (
                        "Result created."
                        if created
                        else "Result updated." if updated else "No changes made."
                    ),
                    "result_id": result.id,
                }
            )

        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    return JsonResponse(
        {"success": False, "error": "Invalid request method."}, status=405
    )


@csrf_exempt
def update_result_flags(request):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "error": "Invalid request method."}, status=405
        )

    try:
        data = json.loads(request.body)
        result_id = data.get("result_id")
        if not result_id:
            return JsonResponse(
                {"success": False, "error": "Result ID is required."}, status=400
            )

        fields = {}
        if "is_downloaded" in data:
            fields["is_downloaded"] = data["is_downloaded"]
        if "is_shared" in data:
            fields["is_shared"] = data["is_shared"]

        if not fields:
            return JsonResponse(
                {"success": False, "error": "No update fields provided."}, status=400
            )

        updated = ParticipantResult.objects.filter(id=result_id).update(**fields)

        if updated:
            return JsonResponse(
                {"success": True, "message": "Result updated.", "result_id": result_id}
            )
        else:
            return JsonResponse(
                {"success": False, "error": "Result not found."}, status=404
            )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)
