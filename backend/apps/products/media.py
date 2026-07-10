import uuid
import cloudinary.uploader
from django.conf import settings
from django.utils.text import slugify


def is_own_cloudinary_url(url):
    """True if `url` is already hosted on our own Cloudinary account (or is blank)."""
    if not url:
        return True
    cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', '')
    return bool(cloud_name) and f'res.cloudinary.com/{cloud_name}/' in url


def rehost_image_url(url, name_hint=''):
    """
    Ensures `url` is hosted on our own Cloudinary account instead of hotlinking
    a third-party domain. If it's already ours (or blank), returns it unchanged.
    Otherwise fetches it server-side and re-uploads it under a slug derived from
    `name_hint` (mirroring the naming used for direct image uploads). Falls back
    to the original URL if the fetch/upload fails (e.g. source unreachable or
    blocking hotlinking) so saving a product never hard-fails on this step.
    """
    if is_own_cloudinary_url(url):
        return url
    try:
        base_slug = slugify(name_hint) or 'product'
        public_id = f'products/{base_slug}-{uuid.uuid4().hex[:6]}'
        result = cloudinary.uploader.upload(
            url,
            public_id=public_id,
            resource_type='image',
            overwrite=True,
        )
        return result.get('secure_url') or url
    except Exception:
        return url


def rehost_image_urls(urls, name_hint=''):
    return [rehost_image_url(u, name_hint) for u in (urls or [])]
