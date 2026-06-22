from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.products.models import Category, Product
from apps.blog.models import BlogPost


class Command(BaseCommand):
    help = 'Prepopulates database with default categories, initial products, and blog posts.'

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
            ("Textile Treatment", "Dyes, mordants, wetting agents, and finishing softeners for fabrics.")
        ]

        categories_map = {}
        for idx, (name, desc) in enumerate(categories_data):
            slug = slugify(name)
            cat, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'description': desc,
                    'seo_title': f"{name} Supplier Kenya | Kivi Chemicals",
                    'seo_description': desc[:150],
                    'order': idx,
                    'is_active': True
                }
            )
            categories_map[slug] = cat
            if created:
                self.stdout.write(f"Created category: {name}")

        self.stdout.write('Seeding initial products...')
        # Prepopulate 2 default products per category
        products_data = [
            # Water Treatment
            {
                'category_slug': 'water-treatment',
                'name': 'Aluminium Sulphate (Alum)',
                'chemical_formula': 'Al2(SO4)3',
                'cas_number': '10043-01-3',
                'grade': 'Technical Grade',
                'un_number': 'UN 3264',
                'short_description': 'Premium coagulant for municipal and industrial wastewater treatment and clarification.',
                'description': 'Aluminium Sulphate is a highly effective chemical coagulant used widely in water purification systems. It aids in the settling of suspended particulate matter by neutralizing the electrical charge of suspended colloidal particles, causing them to clump together as floc.',
                'applications': ['Municipal water treatment', 'Industrial effluent clarification', 'Paper manufacturing sizing'],
                'specifications': {'Purity': '17% Al2O3 Min', 'Insoluble matter': '0.5% Max', 'pH (1% soln)': '3.0 - 4.0'},
                'safety_info': 'Causes skin irritation and serious eye damage. Wear protective gloves and eye protection. In case of contact, rinse thoroughly with water.',
                'is_featured': True
            },
            {
                'category_slug': 'water-treatment',
                'name': 'Calcium Hypochlorite 65%',
                'chemical_formula': 'Ca(ClO)2',
                'cas_number': '7778-54-3',
                'grade': 'Industrial / Chlorination Grade',
                'un_number': 'UN 1748',
                'short_description': 'High-strength granular chlorine sanitizer for disinfection and algae control.',
                'description': 'Calcium Hypochlorite is a powerful oxidizing agent used for water treatment, swimming pool sanitation, and bleaching applications. Destroys pathogens, algae, and organic contaminants quickly.',
                'applications': ['Drinking water chlorination', 'Swimming pool disinfection', 'Sanitation of food processing surfaces'],
                'specifications': {'Available Chlorine': '65.0% Min', 'Moisture': '5.5% - 10.0%', 'Appearance': 'White granular solid'},
                'safety_info': 'Strong oxidizer. Corrosive. Keep away from heat, open flames, and combustible materials. Avoid breathing dust.',
                'is_featured': False
            },
            # Solvents & Thinners
            {
                'category_slug': 'solvents-thinners',
                'name': 'Isopropyl Alcohol (IPA) 99%',
                'chemical_formula': 'C3H8O',
                'cas_number': '67-63-0',
                'grade': 'USP / Cosmetic Grade',
                'un_number': 'UN 1219',
                'short_description': 'High-purity industrial solvent, rubbing agent, and sanitizer formulation base.',
                'description': 'Isopropyl Alcohol is a fast-evaporating solvent used widely in coatings, cosmetics, and cleaning formulations. It is highly miscible in water and organic solvents.',
                'applications': ['Industrial cleaning and degreasing', 'Disinfectant formulation base', 'Solvent for paints and coatings'],
                'specifications': {'Assay': '99.8% Min', 'Water content': '0.1% Max', 'Residue on evaporation': '0.002% Max'},
                'safety_info': 'Highly flammable liquid and vapor. Causes serious eye irritation. May cause drowsiness or dizziness. Keep away from heat and open sparks.',
                'is_featured': True
            },
            {
                'category_slug': 'solvents-thinners',
                'name': 'Toluene',
                'chemical_formula': 'C7H8',
                'cas_number': '108-88-3',
                'grade': 'Industrial Grade',
                'un_number': 'UN 1294',
                'short_description': 'Aromatic solvent widely used in paint thinners, adhesives, and chemical synthesis.',
                'description': 'Toluene is a clear, water-insoluble liquid with a typical smell of paint thinners. It is a common solvent used in paints, lacquers, and adhesives.',
                'applications': ['Paint thinner formulation', 'Adhesive manufacturing solvent', 'Chemical synthesis intermediate'],
                'specifications': {'Purity': '99.5% Min', 'Color (APHA)': '10 Max', 'Density': '0.865 - 0.870 g/cm3'},
                'safety_info': 'Highly flammable. Harmful if inhaled. May cause damage to organs through prolonged exposure. Keep container tightly closed in a cool, well-ventilated space.',
                'is_featured': False
            },
            # Cleaning & Disinfection
            {
                'category_slug': 'cleaning-disinfection',
                'name': 'Hydrogen Peroxide 50%',
                'chemical_formula': 'H2O2',
                'cas_number': '7722-84-1',
                'grade': 'Technical / Disinfection Grade',
                'un_number': 'UN 2014',
                'short_description': 'Powerful eco-friendly oxidizing disinfectant, sanitizer, and bleaching agent.',
                'description': 'Hydrogen Peroxide 50% is a strong oxidizer used for industrial sanitization, pulp bleaching, and wastewater odor control. Decomposes harmlessly into water and oxygen.',
                'applications': ['Textile bleaching agent', 'Aseptic packaging sanitation', 'Industrial water odor treatment'],
                'specifications': {'Concentration': '50.0% Min', 'Stability': '97.0% Min', 'Acidity (as H2SO4)': '0.05% Max'},
                'safety_info': 'Corrosive. Strong oxidizer. Contact with combustible material may cause fire. Wear personal protective equipment including chemical splash goggles.',
                'is_featured': False
            },
            # Detergents & Soaps
            {
                'category_slug': 'detergents-soaps',
                'name': 'Sodium Lauryl Ether Sulfate (SLES) 70%',
                'chemical_formula': 'C12H25O(CH2CH2O)2SO3Na',
                'cas_number': '68585-34-2',
                'grade': 'Cosmetic / Detergent Grade',
                'un_number': 'Non-Hazardous',
                'short_description': 'High-performance anionic surfactant for shampoo, liquid detergent, and hand soap production.',
                'description': 'SLES 70% is an anionic surfactant that provides excellent foaming, cleaning, and emulsifying properties. It is highly compatible with other surfactants and easily thickened with salt.',
                'applications': ['Liquid laundry detergents', 'Shampoos and bath gels', 'Dishwashing liquid soap formulations'],
                'specifications': {'Active Matter': '70% Min', 'Free Sulfate': '3.0% Max', 'pH (10% soln)': '7.0 - 9.0'},
                'safety_info': 'Causes skin irritation. Causes serious eye irritation. Wash hands thoroughly after handling. Wear eye protection.',
                'is_featured': True
            },
            {
                'category_slug': 'detergents-soaps',
                'name': 'Linear Alkyl Benzene Sulfonic Acid (LABSA) 96%',
                'chemical_formula': 'C18H30O3S',
                'cas_number': '27176-87-0',
                'grade': 'Industrial / Detergent Grade',
                'un_number': 'UN 2586',
                'short_description': 'Core active anionic surfactant used for manufacturing powder and liquid detergents.',
                'description': 'LABSA is a synthetic surfactant widely used in domestic and industrial washing powders, cleaning detergents, and household soaps. It has high active matter and excellent washing performance.',
                'applications': ['Detergent powder production', 'Liquid hand wash formulations', 'Car wash soap production'],
                'specifications': {'Active Matter': '96.0% Min', 'Free Oil': '1.5% Max', 'Water Content': '1.0% Max'},
                'safety_info': 'Corrosive liquid. Causes skin and eye burns. In case of inhalation, move to fresh air. Immediately rinse skin/eyes with abundant water.',
                'is_featured': False
            }
        ]

        for p_data in products_data:
            cat_slug = p_data.pop('category_slug')
            cat = categories_map.get(cat_slug)
            if not cat:
                continue

            slug = slugify(p_data['name'])
            prod, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'category': cat,
                    'name': p_data['name'],
                    'chemical_formula': p_data.get('chemical_formula', ''),
                    'cas_number': p_data.get('cas_number', ''),
                    'grade': p_data.get('grade', ''),
                    'un_number': p_data.get('un_number', ''),
                    'short_description': p_data['short_description'],
                    'description': p_data['description'],
                    'applications': p_data.get('applications', []),
                    'specifications': p_data.get('specifications', {}),
                    'safety_info': p_data.get('safety_info', ''),
                    'seo_title': f"{p_data['name']} Supplier Kenya | Kivi Chemicals",
                    'seo_description': p_data['short_description'][:150],
                    'is_featured': p_data.get('is_featured', False),
                    'is_active': True,
                    'in_stock': True
                }
            )
            if created:
                self.stdout.write(f"Created product: {p_data['name']}")

        # For remaining categories without explicit products, let's create simple mock products so they are not empty
        for cat_slug, cat in categories_map.items():
            # Check if this category has products
            if not cat.products.exists():
                mock_name = f"Standard {cat.name} Compound"
                mock_slug = slugify(mock_name)
                Product.objects.get_or_create(
                    slug=mock_slug,
                    defaults={
                        'category': cat,
                        'name': mock_name,
                        'chemical_formula': 'N/A',
                        'cas_number': 'N/A',
                        'grade': 'Industrial Standard',
                        'un_number': '',
                        'short_description': f"High-grade compound formulated specifically for {cat.name.lower()} processes.",
                        'description': f"This standard {cat.name.lower()} chemical is optimized for quality output, safety, and compatibility with regional machinery in East Africa.",
                        'applications': [f"General application in {cat.name.lower()} operations", "Process improvement"],
                        'specifications': {'Purity': '98% Min', 'Form': 'Liquid/Powder'},
                        'safety_info': 'Handle with standard chemical handling precautions. Avoid contact with skin and eyes.',
                        'is_active': True,
                        'in_stock': True
                    }
                )
                self.stdout.write(f"Created mock product for category: {cat.name}")

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
                'seo_title': 'Industrial Coagulant Selection Guide | Wastewater treatment',
                'seo_description': 'Compare Aluminium Sulphate, PAC, and organic polymers for industrial wastewater treatment clarification.'
            },
            {
                'title': 'The Chemistry of Foam: SLES vs. LABSA in Liquid Soap Production',
                'summary': 'An engineering analysis of anionic surfactant behaviors, synergy optimization, and salt-thickening kinetics.',
                'content': 'Soap and detergent manufacturers rely heavily on anionic surfactants like Sodium Lauryl Ether Sulfate (SLES) and Linear Alkyl Benzene Sulfonic Acid (LABSA). While SLES provides high foam volume and skin mildness, LABSA offers robust cleaning performance against oil and dirt.\n\nOptimizing formulation yields requires balancing these two agents. A common ratio of 3:1 (SLES to LABSA) creates a synergetic cleaning performance, which can be thickened efficiently using Sodium Chloride (NaCl) under pH-adjusted parameters (neutralized using caustic soda).'
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
                    'seo_title': b_data.get('seo_title', b_data['title'][:60]),
                    'seo_description': b_data.get('seo_description', b_data['summary'][:150]),
                    'is_published': True
                }
            )
            if created:
                self.stdout.write(f"Created blog post: {b_data['title']}")

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully.'))
