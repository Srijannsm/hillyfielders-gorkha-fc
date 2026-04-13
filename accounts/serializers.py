from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Embed user details so the frontend can read them without a separate request
        token['username']   = user.username
        token['email']      = user.email
        token['first_name'] = user.first_name
        token['last_name']  = user.last_name
        token['is_staff']   = user.is_staff
        return token
