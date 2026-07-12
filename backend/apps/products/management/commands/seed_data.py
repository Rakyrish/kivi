from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.products.models import Category
from apps.blog.models import BlogPost

class Command(BaseCommand):
    help = 'Prepopulates database with default categories and blog posts. Does NOT create placeholder products.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding categories...')
        categories_data = [
            ("Water Treatment", "Chemical agents for municipal and industrial water purification, clarification, and disinfection."),
            ("Solvents & Thinners", "High-purity organic solvents and formulating thinners for paint, adhesive, and cleaning processes."),
            ("Cleaning & Disinfection", "Medical-grade sanitizers, institutional disinfectants, and surface cleaners."),
            ("Paints & Coatings", "Resins, pigments, extenders, and additives for manufacturing protective and decorative coatings."),
            ("Agricultural Chemicals", "Fertilizers, soil conditioners, and crop protection auxiliaries for regional agribusiness."),
            ("Coolants & Thermoregulation", "Heat transfer fluids, antifreeze agents, and HVAC system protectants."),
            ("Preservation Chemicals", "Preservatives for woodwork, leather tanning, and long-term crop storage protection."),
            ("Pharma & Cosmetics", "High-grade excipients, emulsifiers, humectants, and surfactant bases for personal care formulations."),
            ("Detergents & Soaps", "SLES, sulfonic acids, foam boosters, and builders for laundry and hand-soap production."),
            ("Foods & Beverages", "Food-grade preservatives, acidulants, sweeteners, and texturizers compliant with health codes."),
            ("Insulation Materials", "Polyurethane foam components, expanding agents, and thermal barrier coatings."),
            ("Metal Treatment Chemicals", "Pickling acids, rust inhibitors, degreasers, and electroplating auxiliaries."),
            ("Paper & Pulp", "Sizing agents, bleaching helpers, and retention aids for mills."),
            ("Mining Chemicals", "Flotation frothers, collectors, and leaching acids for mineral processing."),
            ("Oil & Gas", "Drilling mud additives, demulsifiers, and corrosion inhibitors for extraction wells."),
            ("Rubber & Plastic", "Plasticizers, vulcanizing agents, blowing agents, and polymer stabilizers."),
            ("Textile Treatment", "Dyes, mordants, wetting agents, and finishing softeners for fabrics."),
            ("Pigments", "Organic and inorganic color pigments for paints, plastics, inks, and industrial coloring applications."),
            ("Dyes", "Textile, leather, and industrial dyes for fabric, tanning, and paper colouring processes."),
            ("Laboratory Reagents", "Analytical-grade reagents, standards, and indicators for laboratory testing and quality control."),
            ("Construction Chemicals", "Admixtures, sealants, waterproofing compounds, and additives for concrete and construction applications."),
        ]
        categories_map = {}
        for idx, (name, desc) in enumerate(categories_data):
            slug = slugify(name)
            seo_title = f"{name} Supplier Kenya | Kivi Chemicals"[:60]
            cat, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'description': desc,
                    'seo_title': seo_title,
                    'seo_description': desc[:150],
                    'order': idx,
                    'is_active': True
                }
            )
            categories_map[slug] = cat
            if created:
                self.stdout.write(f"Created category: {name}")

        self.stdout.write('Seeding blog posts...')
        blog_posts = [
            {
                'title': 'Safety Guidelines for Transporting Hazardous Chemicals in East Africa',
                'summary': 'A comprehensive overview of UN hazmat classification, KEBS safety standards, and regional transport regulations for manufacturers.',
                'content': 'Industrial chemical logistics require meticulous adherence to regulatory protocols to prevent accidents and ensure compliance. In East Africa, transporting substances like strong acids (UN 1830) or oxidizers (UN 1748) is governed by national regulatory bodies such as KEBS in Kenya, alongside regional transit declarations.\n\nKey safety protocols include:\n1. Classifying hazard categories accurately using UN tags.\n2. Labeling vehicles and transport containers with the correct hazard placards.\n3. Ensuring drivers possess valid dangerous goods permits and spill response equipment.\n\nMaintaining strict logistics documentation, including safety data sheets (MSDS) and emergency contact lists, remains the single most effective way to manage compliance.',
                'seo_title': 'Hazardous Chemical Transport Guidelines Kenya | Kivi',
                'seo_description': 'Learn about UN hazard tagging, safety requirements, and KEBS guidelines for transporting chemical compounds in East Africa.'
            },
            {
                'title': 'Selecting the Right Coagulant for Wastewater Treatment Systems',
                'summary': 'Comparing the efficacy of Aluminium Sulphate, Polyaluminium Chloride (PAC), and organic polymers in turbidity reduction.',
                'content': 'Industrial effluent management requires choosing the right coagulants. Choosing between inorganic salts like Aluminium Sulphate (alum) or PAC depends heavily on raw water pH, organic load, and settling time constraints.\n\nAlum remains the most cost-effective solution for municipal systems with stable pH levels. However, Polyaluminium Chloride offers superior floc formation in low-temperature or fluctuating pH environments. Testing with jar tests is highly recommended before choosing your coagulants.',
                'seo_title': 'Industrial Coagulant Selection Guide | Wastewater',
                'seo_description': 'Compare Aluminium Sulphate, PAC, and organic polymers for industrial wastewater treatment clarification.'
            },
            {
                'title': 'The Chemistry of Foam: SLES vs. LABSA in Liquid Soap Production',
                'summary': 'An engineering analysis of anionic surfactant behaviors, synergy optimization, and salt-thickening kinetics.',
                'content': 'Soap and detergent manufacturers rely heavily on anionic surfactants like Sodium Lauryl Ether Sulfate (SLES) and Linear Alkyl Benzene Sulfonic Acid (LABSA). While SLES provides high foam volume and skin mildness, LABSA offers robust cleaning performance against oil and dirt.\n\nOptimizing formulation yields requires balancing these two agents. A common ratio of 3:1 (SLES to LABSA) creates a synergetic cleaning performance, which can be thickened efficiently using Sodium Chloride (NaCl) under pH-adjusted parameters (neutralized using caustic soda).',
                'seo_title': 'SLES vs LABSA in Soap Production | Kivi Chemicals',
                'seo_description': 'Engineering analysis of SLES and LABSA surfactant behaviors and formulation optimization for liquid soap.'
            }
        ]

        for b_data in blog_posts:
            slug = slugify(b_data['title'])
            post, created = BlogPost.objects.get_or_create(
                slug=slug,
                defaults={
                    'title': b_data['title'],
                    'summary': b_data['summary'],
                    'content': b_data['content'],
                    'seo_title': b_data.get('seo_title', b_data['title'])[:60],
                    'seo_description': b_data.get('seo_description', b_data['summary'])[:150],
                    'is_published': True
                }
            )
            if created:
                self.stdout.write(f"Created blog post: {b_data['title']}")

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully.'))
