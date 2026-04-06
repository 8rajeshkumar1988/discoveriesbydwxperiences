from django.db import models


class Quiz(models.Model):
    question = models.TextField(max_length=500, blank=False, null=False)
    sequence = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.question


class Option(models.Model):
    question = models.ForeignKey(Quiz,on_delete=models.CASCADE, null=True, blank=False)
    OPTIONS = [
        ("a", "A"),
        ("b", "B"),
        ("c", "C"),
    ]
    option = models.CharField(
        max_length=1, default="1", null=True, blank=False, choices=OPTIONS
    )

    option_text = models.TextField(max_length=500, blank=False, null=False)
    sequence = models.IntegerField(default=1)

    def __str__(self):
        return self.option
