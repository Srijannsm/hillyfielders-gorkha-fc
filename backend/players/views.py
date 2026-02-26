from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from .models import Player
from .serializers import PlayerSerializer
from .forms import PlayerRegistrationForm, PlayerEditForm
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from rest_framework.permissions import AllowAny, IsAuthenticated


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [AllowAny]


@login_required
def profile(request):
    player = request.user.player  # this is the linked Player
    return render(request, "players/profile.html", {"player": player})

@login_required
def edit_profile(request):
    player = request.user.player

    if request.method == "POST":
        form = PlayerEditForm(request.POST, instance=player)
        if form.is_valid():
            form.save()
            return redirect("player_profile")
    else:
        form = PlayerEditForm(instance=player)

    return render(request, "players/edit_profile.html", {"form": form})


def register_player(request):
    if request.method == "POST":
        form = PlayerRegistrationForm(request.POST)
        if form.is_valid():
            # 1. Create the User
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = User.objects.create_user(username=username, password=password)

            # 2. Create the Player and link it to User
            player = form.save(commit=False)  # save Player without committing yet
            player.user = user
            player.save()

            # 3. Log in the user automatically
            login(request, user)

            return redirect("player_profile")  # redirect to profile page
    else:
        form = PlayerRegistrationForm()
    return render(request, "players/register.html", {"form": form})
