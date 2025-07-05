
class PortfolioGenerator {
    constructor() {
        this.currentStep = 1;
        this.selectedTemplate = null;
        this.selectedTheme = 'blue';
        this.userData = {};
        this.projects = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupThemeToggle();
        this.updateStepVisibility();
    }

    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectTemplate(e));
        });

        // Navigation buttons
        document.getElementById('nextToStep2').addEventListener('click', () => this.goToStep(2));
        document.getElementById('nextToStep3').addEventListener('click', () => this.goToStep(3));
        document.getElementById('nextToStep4').addEventListener('click', () => this.goToStep(4));
        document.getElementById('backToStep1').addEventListener('click', () => this.goToStep(1));
        document.getElementById('backToStep2').addEventListener('click', () => this.goToStep(2));
        document.getElementById('backToStep3').addEventListener('click', () => this.goToStep(3));

        // Form validation
        document.getElementById('detailsForm').addEventListener('input', () => this.validateForm());

        // Color theme selection
        document.querySelectorAll('.color-theme').forEach(theme => {
            theme.addEventListener('click', (e) => this.selectTheme(e));
        });

        // Project management
        document.getElementById('addProject').addEventListener('click', () => this.addProject());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-project')) {
                this.removeProject(e.target.closest('.project-item'));
            }
        });

        // Preview and deployment
        document.getElementById('generatePreview').addEventListener('click', () => this.generatePreview());
        document.getElementById('downloadZip').addEventListener('click', () => this.downloadZip());
        document.getElementById('deployPortfolio').addEventListener('click', () => this.deployPortfolio());

        // File upload
        document.getElementById('profileImage').addEventListener('change', (e) => this.handleImageUpload(e));

        // Premium modal
        document.querySelector('.close').addEventListener('click', () => this.closePremiumModal());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('template-badge') && e.target.textContent === 'Premium') {
                this.showPremiumModal();
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const isDark = localStorage.getItem('theme') === 'dark';
        
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            themeToggle.innerHTML = newTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        });
    }

    selectTemplate(event) {
        // Remove previous selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        const card = event.currentTarget;
        card.classList.add('selected');
        
        this.selectedTemplate = card.dataset.template;
        
        // Check if it's a premium template
        if (card.querySelector('.template-badge.premium')) {
            this.showPremiumModal();
            return;
        }

        // Enable next button
        document.getElementById('nextToStep2').disabled = false;
    }

    selectTheme(event) {
        document.querySelectorAll('.color-theme').forEach(theme => {
            theme.classList.remove('active');
        });

        event.currentTarget.classList.add('active');
        this.selectedTheme = event.currentTarget.dataset.theme;
    }

    goToStep(step) {
        if (step === 3 && !this.validateForm()) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.currentStep = step;
        this.updateStepVisibility();
        this.updateStepIndicator();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateStepVisibility() {
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`step${this.currentStep}`).classList.add('active');
    }

    updateStepIndicator() {
        document.querySelectorAll('.steps-indicator .step').forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    validateForm() {
        const requiredFields = ['fullName', 'jobTitle', 'email', 'bio', 'skills'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                isValid = false;
            }
        });

        return isValid;
    }

    addProject() {
        const projectsList = document.getElementById('projectsList');
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <input type="text" placeholder="Project Name" class="project-name">
            <input type="text" placeholder="Description" class="project-desc">
            <input type="url" placeholder="Project URL (optional)" class="project-url">
            <button type="button" class="remove-project">×</button>
        `;
        projectsList.appendChild(projectItem);
    }

    removeProject(projectItem) {
        projectItem.remove();
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('imagePreview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    collectUserData() {
        // Collect basic information
        this.userData = {
            fullName: document.getElementById('fullName').value,
            jobTitle: document.getElementById('jobTitle').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            website: document.getElementById('website').value,
            bio: document.getElementById('bio').value,
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()),
            profileImage: document.querySelector('#imagePreview img')?.src || null
        };

        // Collect projects
        this.projects = [];
        document.querySelectorAll('.project-item').forEach(item => {
            const name = item.querySelector('.project-name').value;
            const desc = item.querySelector('.project-desc').value;
            const url = item.querySelector('.project-url').value;
            
            if (name || desc) {
                this.projects.push({ name, desc, url });
            }
        });

        // Collect section preferences
        this.userData.sections = {
            about: true,
            skills: true,
            projects: document.getElementById('includeProjects').checked,
            resume: document.getElementById('includeResume').checked,
            contact: true
        };
    }

    generatePreview() {
        this.collectUserData();
        
        const previewContainer = document.getElementById('previewContainer');
        previewContainer.innerHTML = this.generatePortfolioHTML();
        
        this.showNotification('Preview generated successfully!', 'success');
    }

    generatePortfolioHTML() {
        const themeColors = {
            blue: { primary: '#3b82f6', secondary: '#1d4ed8' },
            purple: { primary: '#8b5cf6', secondary: '#7c3aed' },
            green: { primary: '#10b981', secondary: '#059669' },
            orange: { primary: '#f59e0b', secondary: '#d97706' }
        };

        const colors = themeColors[this.selectedTheme];

        return `
            <div class="portfolio-preview" style="
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">
                <!-- Header -->
                <header style="text-align: center; margin-bottom: 3rem; padding: 2rem; background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); border-radius: 8px; color: white;">
                    ${this.userData.profileImage ? `<img src="${this.userData.profileImage}" style="width: 120px; height: 120px; border-radius: 50%; margin-bottom: 1rem; border: 4px solid white;">` : ''}
                    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${this.userData.fullName}</h1>
                    <p style="font-size: 1.2rem; opacity: 0.9;">${this.userData.jobTitle}</p>
                    <p style="opacity: 0.8;">${this.userData.location}</p>
                </header>

                <!-- About Section -->
                <section style="margin-bottom: 3rem;">
                    <h2 style="color: ${colors.primary}; border-bottom: 2px solid ${colors.primary}; padding-bottom: 0.5rem; margin-bottom: 1rem;">About Me</h2>
                    <p style="line-height: 1.6; color: #374151;">${this.userData.bio}</p>
                </section>

                <!-- Skills Section -->
                <section style="margin-bottom: 3rem;">
                    <h2 style="color: ${colors.primary}; border-bottom: 2px solid ${colors.primary}; padding-bottom: 0.5rem; margin-bottom: 1rem;">Skills</h2>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${this.userData.skills.map(skill => `
                            <span style="background: ${colors.primary}; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">${skill}</span>
                        `).join('')}
                    </div>
                </section>

                ${this.userData.sections.projects && this.projects.length > 0 ? `
                <!-- Projects Section -->
                <section style="margin-bottom: 3rem;">
                    <h2 style="color: ${colors.primary}; border-bottom: 2px solid ${colors.primary}; padding-bottom: 0.5rem; margin-bottom: 1rem;">Projects</h2>
                    ${this.projects.map(project => `
                        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid ${colors.primary};">
                            <h3 style="margin-bottom: 0.5rem; color: #1f2937;">${project.name}</h3>
                            <p style="color: #6b7280; margin-bottom: 1rem;">${project.desc}</p>
                            ${project.url ? `<a href="${project.url}" style="color: ${colors.primary}; text-decoration: none;">View Project →</a>` : ''}
                        </div>
                    `).join('')}
                </section>
                ` : ''}

                <!-- Contact Section -->
                <section style="text-align: center; background: #f8fafc; padding: 2rem; border-radius: 8px;">
                    <h2 style="color: ${colors.primary}; margin-bottom: 1rem;">Get In Touch</h2>
                    <p style="color: #6b7280; margin-bottom: 1rem;">I'd love to hear from you!</p>
                    <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                        <a href="mailto:${this.userData.email}" style="color: ${colors.primary}; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid ${colors.primary}; border-radius: 4px;">Email</a>
                        ${this.userData.phone ? `<a href="tel:${this.userData.phone}" style="color: ${colors.primary}; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid ${colors.primary}; border-radius: 4px;">Phone</a>` : ''}
                        ${this.userData.website ? `<a href="${this.userData.website}" style="color: ${colors.primary}; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid ${colors.primary}; border-radius: 4px;">Website</a>` : ''}
                    </div>
                </section>
            </div>
        `;
    }

    downloadZip() {
        this.collectUserData();
        
        // Create portfolio files
        const files = this.generatePortfolioFiles();
        
        // In a real implementation, you would use JSZip library
        // For now, we'll show a notification
        this.showNotification('Download feature will be available in the full version. For now, you can copy the preview HTML.', 'info');
        
        // Optional: Open the generated HTML in a new window
        const newWindow = window.open();
        newWindow.document.write(this.generateCompletePortfolioHTML());
        newWindow.document.close();
    }

    generateCompletePortfolioHTML() {
        const themeColors = {
            blue: { primary: '#3b82f6', secondary: '#1d4ed8' },
            purple: { primary: '#8b5cf6', secondary: '#7c3aed' },
            green: { primary: '#10b981', secondary: '#059669' },
            orange: { primary: '#f59e0b', secondary: '#d97706' }
        };

        const colors = themeColors[this.selectedTheme];

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.userData.fullName} - Portfolio</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; 
            color: #1f2937;
            background: #ffffff;
        }
        .container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
        .header { 
            text-align: center; 
            margin-bottom: 4rem; 
            padding: 3rem; 
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); 
            border-radius: 12px; 
            color: white;
        }
        .profile-img { 
            width: 150px; 
            height: 150px; 
            border-radius: 50%; 
            margin-bottom: 1.5rem; 
            border: 4px solid white;
            object-fit: cover;
        }
        .name { font-size: 3rem; margin-bottom: 0.5rem; font-weight: 700; }
        .title { font-size: 1.3rem; opacity: 0.9; margin-bottom: 0.5rem; }
        .location { opacity: 0.8; }
        
        .section { margin-bottom: 4rem; }
        .section-title { 
            color: ${colors.primary}; 
            border-bottom: 3px solid ${colors.primary}; 
            padding-bottom: 0.5rem; 
            margin-bottom: 2rem; 
            font-size: 2rem;
            font-weight: 600;
        }
        
        .skills-container { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .skill-tag { 
            background: ${colors.primary}; 
            color: white; 
            padding: 0.75rem 1.25rem; 
            border-radius: 25px; 
            font-size: 0.95rem;
            font-weight: 500;
        }
        
        .project-card { 
            background: #f8fafc; 
            padding: 2rem; 
            border-radius: 12px; 
            margin-bottom: 1.5rem; 
            border-left: 5px solid ${colors.primary};
            transition: transform 0.2s ease;
        }
        .project-card:hover { transform: translateY(-2px); }
        .project-title { margin-bottom: 0.75rem; color: #1f2937; font-size: 1.3rem; font-weight: 600; }
        .project-desc { color: #6b7280; margin-bottom: 1.25rem; font-size: 1.05rem; }
        .project-link { 
            color: ${colors.primary}; 
            text-decoration: none; 
            font-weight: 600;
            border-bottom: 2px solid transparent;
            transition: border-bottom 0.2s ease;
        }
        .project-link:hover { border-bottom-color: ${colors.primary}; }
        
        .contact-section { 
            text-align: center; 
            background: linear-gradient(135deg, #f8fafc, #e5e7eb); 
            padding: 3rem; 
            border-radius: 12px;
        }
        .contact-links { 
            display: flex; 
            justify-content: center; 
            gap: 1.5rem; 
            flex-wrap: wrap;
            margin-top: 2rem;
        }
        .contact-link { 
            color: ${colors.primary}; 
            text-decoration: none; 
            padding: 0.75rem 1.5rem; 
            border: 2px solid ${colors.primary}; 
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .contact-link:hover { 
            background: ${colors.primary}; 
            color: white;
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .container { padding: 1rem; }
            .name { font-size: 2.5rem; }
            .title { font-size: 1.1rem; }
            .section-title { font-size: 1.5rem; }
            .contact-links { flex-direction: column; align-items: center; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            ${this.userData.profileImage ? `<img src="${this.userData.profileImage}" alt="${this.userData.fullName}" class="profile-img">` : ''}
            <h1 class="name">${this.userData.fullName}</h1>
            <p class="title">${this.userData.jobTitle}</p>
            ${this.userData.location ? `<p class="location">${this.userData.location}</p>` : ''}
        </header>

        <section class="section">
            <h2 class="section-title">About Me</h2>
            <p style="font-size: 1.1rem; line-height: 1.8;">${this.userData.bio}</p>
        </section>

        <section class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-container">
                ${this.userData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </section>

        ${this.userData.sections.projects && this.projects.length > 0 ? `
        <section class="section">
            <h2 class="section-title">Projects</h2>
            ${this.projects.map(project => `
                <div class="project-card">
                    <h3 class="project-title">${project.name}</h3>
                    <p class="project-desc">${project.desc}</p>
                    ${project.url ? `<a href="${project.url}" class="project-link" target="_blank">View Project →</a>` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        <section class="contact-section">
            <h2 class="section-title">Get In Touch</h2>
            <p style="color: #6b7280; font-size: 1.1rem;">I'd love to hear from you! Let's connect and discuss opportunities.</p>
            <div class="contact-links">
                <a href="mailto:${this.userData.email}" class="contact-link">📧 Email</a>
                ${this.userData.phone ? `<a href="tel:${this.userData.phone}" class="contact-link">📞 Phone</a>` : ''}
                ${this.userData.website ? `<a href="${this.userData.website}" class="contact-link" target="_blank">🌐 Website</a>` : ''}
            </div>
        </section>
    </div>
</body>
</html>
        `;
    }

    deployPortfolio() {
        this.collectUserData();
        
        // Simulate deployment process
        const deployBtn = document.getElementById('deployPortfolio');
        const originalText = deployBtn.innerHTML;
        
        deployBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deploying...';
        deployBtn.disabled = true;

        setTimeout(() => {
            deployBtn.innerHTML = originalText;
            deployBtn.disabled = false;
            
            // Generate a mock subdomain
            const subdomain = this.userData.fullName.toLowerCase().replace(/\s+/g, '-');
            this.showNotification(`Portfolio deployed successfully! Visit: ${subdomain}.replit.app`, 'success');
        }, 3000);
    }

    showPremiumModal() {
        document.getElementById('premiumModal').classList.add('active');
    }

    closePremiumModal() {
        document.getElementById('premiumModal').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Add slide in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // Add slide out animation
        style.textContent += `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
    }
}

// PayPal payment integration
function openPayPalPayment() {
    const paypalUrl = 'https://paypal.me/Mohit200672?country.x=IN&locale.x=en_GB';
    
    // Open PayPal payment page in a new window
    const paymentWindow = window.open(
        paypalUrl,
        'paypal_payment',
        'width=600,height=700,scrollbars=yes,resizable=yes'
    );
    
    // Show notification
    const portfolioGenerator = document.querySelector('.app-container').__portfolioGenerator;
    if (portfolioGenerator) {
        portfolioGenerator.showNotification('Redirecting to PayPal for payment...', 'info');
    }
    
    // Optional: Listen for when the payment window is closed
    const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
            clearInterval(checkClosed);
            if (portfolioGenerator) {
                portfolioGenerator.showNotification('Payment window closed. If payment was successful, you now have premium access!', 'success');
                portfolioGenerator.closePremiumModal();
            }
        }
    }, 1000);
}

// Initialize the Portfolio Generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const portfolioGenerator = new PortfolioGenerator();
    // Store reference for PayPal integration
    document.querySelector('.app-container').__portfolioGenerator = portfolioGenerator;
});
