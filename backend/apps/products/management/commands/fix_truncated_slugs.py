from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.products.models import Product, SlugRedirect, _truncate_at_word_boundary


class Command(BaseCommand):
    help = (
        "Finds products whose slug was cut off mid-word by the old truncation bug "
        "(SlugField max_length=50 with no word-boundary awareness — e.g. "
        "'...kenya-uganda-tanzani' instead of '...kenya-uganda-tanzania'), regenerates "
        "a correct slug now that the field allows up to 180 characters, and records a "
        "SlugRedirect so the old, already-indexed URL 301s instead of 404ing. "
        "Run with --dry-run first to preview."
    )

    # The old SlugField max_length new slugs used to be silently cut down to.
    OLD_MAX_LEN = 50

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Preview affected products without changing anything.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        affected = 0

        for product in Product.objects.all().order_by('id'):
            if len(product.slug) != self.OLD_MAX_LEN:
                continue  # only the old ceiling length is a truncation candidate

            full_slug = slugify(product.name)
            if full_slug == product.slug:
                continue  # exactly 50 chars by coincidence — nothing was cut

            new_slug = _truncate_at_word_boundary(full_slug, 180)
            candidate = new_slug
            counter = 1
            while Product.objects.filter(slug=candidate).exclude(pk=product.pk).exists():
                candidate = f'{new_slug}-{counter}'
                counter += 1
            new_slug = candidate

            affected += 1
            self.stdout.write(f'{product.slug!r} -> {new_slug!r}  ({product.name})')

            if not dry_run:
                old_slug = product.slug
                product.slug = new_slug
                product.save(update_fields=['slug'])
                SlugRedirect.objects.get_or_create(old_slug=old_slug, defaults={'product': product})

        if affected == 0:
            self.stdout.write(self.style.SUCCESS('No truncated slugs found.'))
        elif dry_run:
            self.stdout.write(self.style.WARNING(
                f'[dry run] {affected} product(s) would be renamed. Re-run without --dry-run to apply.'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(f'{affected} product(s) renamed; redirects recorded.'))
