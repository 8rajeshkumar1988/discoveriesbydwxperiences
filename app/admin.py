from django.contrib import admin

from .models import Quiz, Option


class QuizAdmin(admin.ModelAdmin):
    list_display = ("question", "sequence")
    list_per_page = 20  # record 10 per page
    list_editable = [
        "sequence",
    ]

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(Quiz, QuizAdmin)


class OptionAdmin(admin.ModelAdmin):
    list_display = ("question", "option", "option_text", "sequence")
    list_per_page = 20  # record 10 per page
    list_editable = [
        "sequence",
    ]

    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(Option, OptionAdmin)
