from django.db import models


class Participant(models.Model):
    name = models.CharField(max_length=40,blank=False,null=False)
    location=models.CharField(max_length=40,blank=False,null=True)
    CLASS_OPTIONS = [
        ("", ""),
        ("Premium", "Premium"),
        ("Economy", "Economy"),
        
    ]
    class_type = models.CharField(
        max_length=20, default="", null=True, blank=False, choices=CLASS_OPTIONS
    )


    ip_address = models.CharField(max_length=100,blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class QuizAttempt(models.Model):
    participant = models.ForeignKey(Participant,null=True, blank=False, on_delete=models.CASCADE)
    quiz = models.ForeignKey("app.Quiz",null=True, blank=False, on_delete=models.CASCADE)
    option = models.ForeignKey("app.Option",null=True, blank=False, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('participant', 'quiz', 'option')

    def __str__(self):
        return self.participant.name
    

class ParticipantResult(models.Model):
    participant = models.ForeignKey(Participant,null=True, blank=False, on_delete=models.CASCADE)
    
    option=models.CharField(max_length=1)
     
    

    OPTIONS = [
        ("", ""),
        ("The Explorer", "The Explorer"),
        ("The Socializer", "The Socializer"),
        ("The Storyteller", "The Storyteller"),
    ]
    card_name = models.CharField(
        max_length=20, default="", null=True, blank=False, choices=OPTIONS
    )
    
    is_downloaded=models.BooleanField(default=False)
    is_shared=models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.participant.name


