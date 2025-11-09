const modal = document.getElementById('projectModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

let isAnimating = false;

function openModal() {
    if (isAnimating) return;
    isAnimating = true;
    
    modal.style.display = 'flex';
    modal.classList.remove('closing');
    modal.classList.add('opening');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        isAnimating = false;
    }, 300);
}

function closeModal() {
    if (isAnimating) return;
    isAnimating = true;
    
    modal.classList.remove('opening');
    modal.classList.add('closing');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        document.body.style.overflow = '';
        isAnimating = false;
    }, 300);
}

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('opening')) {
        closeModal();
    }
});

const mdConverter = new showdown.Converter();

document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const projectName = btn.dataset.project;
        const hasCustomDescription = btn.dataset.customDescription === 'true';

        openModal();
        modalBody.innerHTML = '<div class="loader">Загрузка README...</div>';
        debugger;
        try {
            if (hasCustomDescription) {
                const response = await fetch(`./${projectName}/index.html`);
                
                if (!response.ok) {
                    throw new Error('Локальное описание не найдено');
                }
                
                const htmlContent = await response.text();
                modalBody.innerHTML = htmlContent;
            } else {
                const response = await fetch(`https://api.github.com/repos/slappidyslap/${projectName}/readme`);
                
                if (!response.ok) {
                    throw new Error('README не найден');
                }
                
                const data = await response.json();
                const readmeContent = decodeURIComponent(escape(atob(data.content)));
                const htmlContent = mdConverter.makeHtml(readmeContent);
                modalBody.innerHTML = `<div class="readme-content">${htmlContent}</div>`;
            }
        } catch (error) {
            modalBody.innerHTML = `
                <div class="readme-content">
                    <h2>Информация недоступна</h2>
                    <p>К сожалению, не удалось загрузить описание проекта.</p>
                    <p>Вы можете посмотреть проект на <a href="https://github.com/slappidyslap/${projectName}" target="_blank">GitHub</a>.</p>
                </div>
            `;
        }
    });
});
