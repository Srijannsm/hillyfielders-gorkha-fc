from django import forms
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from players.models import Player


class PlayerRegistrationForm(forms.ModelForm):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(widget=forms.PasswordInput, label="Confirm password")

    class Meta:
        model = Player
        fields = [
            "first_name",
            "last_name",
            "date_of_birth",
            "email",
            "contact_number",
            "preferred_foot",
            "position",
        ]

    def clean_password2(self):
        password = self.cleaned_data.get("password")
        password2 = self.cleaned_data.get("password2")
        if password != password2:
            raise ValidationError("Passwords do not match")
        return password2

    def clean_username(self):
        username = self.cleaned_data.get("username")
        if User.objects.filter(username=username).exists():
            raise ValidationError("Username already exists")
        return username


class PlayerEditForm(forms.ModelForm):
    class Meta:
        model = Player
        fields = ["first_name", "last_name", "date_of_birth", "email", "contact_number", "preferred_foot", "position"]