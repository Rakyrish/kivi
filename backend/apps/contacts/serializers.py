import os
import uuid

import cloudinary.uploader
from rest_framework import serializers

from .models import ContactSubmission, InquiryReply

ALLOWED_ATTACHMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.webp'}
ALLOWED_ATTACHMENT_MIME_TYPES = {
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
}
MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024  # 5MB


class InquiryReplySerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = InquiryReply
        fields = ['id', 'message', 'created_at', 'created_by_name']
        read_only_fields = fields

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return 'Kivi Chemicals Team'
        return obj.created_by.get_full_name() or obj.created_by.username


class ContactSubmissionSerializer(serializers.ModelSerializer):
    attachment = serializers.FileField(write_only=True, required=False, allow_null=True)
    # Phase 2 anti-spam hook: a field bots fill blindly but humans never see
    # (hidden via CSS on the frontend). Inert in Phase 1 — always discarded.
    hp_field = serializers.CharField(write_only=True, required=False, allow_blank=True)
    replies = InquiryReplySerializer(many=True, read_only=True)

    class Meta:
        model = ContactSubmission
        fields = '__all__'
        read_only_fields = (
            'reference_number', 'status', 'attachment_url', 'attachment_filename',
            'created_at', 'updated_at',
        )

    def validate_attachment(self, file):
        ext = os.path.splitext(file.name)[1].lower()
        if ext not in ALLOWED_ATTACHMENT_EXTENSIONS:
            raise serializers.ValidationError('Unsupported file type. Allowed: PDF, Word, Excel, JPG, PNG, WEBP.')
        if file.content_type not in ALLOWED_ATTACHMENT_MIME_TYPES:
            raise serializers.ValidationError('Unsupported file type.')
        if file.size > MAX_ATTACHMENT_SIZE:
            raise serializers.ValidationError('File too large — maximum size is 5MB.')
        return file

    def create(self, validated_data):
        validated_data.pop('hp_field', None)
        attachment = validated_data.pop('attachment', None)
        instance = ContactSubmission(**validated_data)
        if attachment:
            self._upload_attachment(instance, attachment)
        instance.save()
        return instance

    def _upload_attachment(self, instance, file):
        try:
            file.seek(0)
            result = cloudinary.uploader.upload(
                file,
                folder='inquiries',
                resource_type='raw',
                public_id=f"inquiries/{uuid.uuid4().hex[:10]}",
                overwrite=True,
            )
            instance.attachment_url = result.get('secure_url', '')
            instance.attachment_filename = file.name
        except Exception:
            # Never block inquiry submission on an attachment upload failure
            pass


class ContactSubmissionStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ['status']


class InquiryReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InquiryReply
        fields = ['message']

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError('Reply message cannot be empty.')
        return value
