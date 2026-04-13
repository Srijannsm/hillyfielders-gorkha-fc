from django.db import models
from players.models import Team

class Competition(models.Model):
    name = models.CharField(max_length=200)  # e.g. "Nepal Super League"
    season = models.CharField(max_length=20)  # e.g. "2025/26"

    def __str__(self):
        return f"{self.name} {self.season}"


class Fixture(models.Model):
    home_team_name = models.CharField(max_length=100)
    away_team_name = models.CharField(max_length=100)
    our_team = models.ForeignKey(Team, on_delete=models.PROTECT)
    competition = models.ForeignKey(Competition, on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField()
    venue = models.CharField(max_length=200, blank=True)
    is_home_game = models.BooleanField(default=True)

    # Results — blank until match is played
    home_score = models.PositiveIntegerField(null=True, blank=True)
    away_score = models.PositiveIntegerField(null=True, blank=True)

    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.home_team_name} vs {self.away_team_name} — {self.date.strftime('%d %b %Y')}"

    @property
    def result(self):
        # Automatically works out win/loss/draw — no manual input needed
        if not self.is_completed:
            return None
        gorkha_score = self.home_score if self.is_home_game else self.away_score
        opp_score = self.away_score if self.is_home_game else self.home_score
        if gorkha_score > opp_score:
            return 'W'
        elif gorkha_score < opp_score:
            return 'L'
        return 'D'