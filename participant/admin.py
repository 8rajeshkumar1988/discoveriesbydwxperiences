from django.contrib import admin

import csv
from django.http import HttpResponse


from .models import Participant, QuizAttempt, ParticipantResult
from django.utils.html import format_html
from django.utils.timezone import make_aware
from django.template.response import TemplateResponse
from django.urls import path
from datetime import datetime
from .admin_filters import CustomDateFilter


class ParticipantAdmin(admin.ModelAdmin):
    list_display = ("name", "class_type", "ip_address","location" ,"created_at")
    list_per_page = 20  # record 10 per page
    search_fields = ["name", "ip_address", "class_type"]
    list_filter = [CustomDateFilter, "class_type"]

    actions = ["export_selected"]

    def export_selected(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="participant.csv"'

        writer = csv.writer(response)
        header_row = [field.name for field in Participant._meta.fields]
        writer.writerow(header_row)  # Header row

        for obj in queryset:
            obj_fields = [
                getattr(obj, field.name) for field in Participant._meta.fields
            ]
            writer.writerow(obj_fields)

        return response

    export_selected.short_description = "Export selected items to CSV"

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(Participant, ParticipantAdmin)


class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "participant",
        "quiz",
        "option",
        "participant__class_type",
        "participant__location",
        "created_at",
    )
    list_per_page = 20  # record 10 per page
    list_filter = [CustomDateFilter, "quiz", "participant__class_type"]

    actions = ["export_selected"]

    def export_selected(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="QuizAttempt.csv"'

        writer = csv.writer(response)

        # Base field names
        field_names = [field.name for field in QuizAttempt._meta.fields]
        # Add custom field
        header_row = field_names + ["participant_class_type"]
        header_row = header_row + ["participant_location"]
        writer.writerow(header_row)

        for obj in queryset:
            row = [getattr(obj, field) for field in field_names]
            # Add the related field value
            row.append(getattr(obj.participant, "class_type", ""))
            row.append(getattr(obj.participant, "location", ""))
            writer.writerow(row)

        return response

    export_selected.short_description = "Export selected items to CSV"

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(QuizAttempt, QuizAttemptAdmin)


class ParticipantResultAdmin(admin.ModelAdmin):

    list_display = (
        "participant",
        "option",
        "card_name",
        "participant__class_type",
        "participant__location",
        "is_downloaded",
        "is_shared",
        "created_at",
    )
    list_per_page = 20  # record 10 per page
    search_fields = ["participant__name", "card_name"]
    list_filter = [
        "is_downloaded",
        "is_shared",
        "card_name",
        "participant__class_type",
        CustomDateFilter,
    ]

    actions = ["export_selected"]

    def export_selected(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="ParticipantResult.csv"'

        writer = csv.writer(response)

        # Get field names from ParticipantResult model
        field_names = [field.name for field in ParticipantResult._meta.fields]

        # Add custom related field to header
        header_row = field_names + ['participant_class_type']
      

        header_row = header_row + ['participant__location']
        writer.writerow(header_row)


        for obj in queryset:
            # Get field values from model
            row = [getattr(obj, field) for field in field_names]

            # Append participant.class_type safely
            class_type = getattr(obj.participant, 'class_type', '') if obj.participant else ''
            row.append(class_type)

            location = getattr(obj.participant, 'location', '') if obj.participant else ''
            row.append(location)

            writer.writerow(row)

        return response

    export_selected.short_description = "Export selected items to CSV"

    def has_delete_permission(self, request, obj=None):
        return False

    # def changelist_view(self, request, extra_context=None):
    #     from_date = request.GET.get("from_date")
    #     to_date = request.GET.get("to_date")

    #     queryset = self.get_queryset(request)

    #     if from_date:
    #         from_date_obj = make_aware(datetime.strptime(from_date, "%Y-%m-%d"))
    #         queryset = queryset.filter(your_date_field__gte=from_date_obj)

    #     if to_date:
    #         to_date_obj = make_aware(datetime.strptime(to_date, "%Y-%m-%d"))
    #         queryset = queryset.filter(your_date_field__lte=to_date_obj)

    #     extra_context = extra_context or {}
    #     extra_context["from_date"] = from_date
    #     extra_context["to_date"] = to_date

    #     response = super().changelist_view(request, extra_context=extra_context)
    #     response.context_data["cl"].queryset = queryset
    #     return response


admin.site.register(ParticipantResult, ParticipantResultAdmin)
