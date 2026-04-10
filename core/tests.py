from rest_framework.test import APITestCase
from rest_framework import status


class ContactAPITests(APITestCase):
    def test_contact_missing_fields_returns_400(self):
        res = self.client.post('/api/contact/', {'name': 'Test', 'email': 'test@example.com'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_contact_invalid_email_returns_400(self):
        res = self.client.post('/api/contact/', {
            'name': 'Test', 'email': 'notanemail', 'message': 'Hello there'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_contact_empty_fields_returns_400(self):
        res = self.client.post('/api/contact/', {'name': '', 'email': '', 'message': ''})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
