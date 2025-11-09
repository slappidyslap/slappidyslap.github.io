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

document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const projectName = btn.dataset.project;
        openModal();
        modalBody.innerHTML = '<div class="loader">Загрузка README...</div>';
        
        try {
            const response = await fetch(`https://api.github.com/repos/slappidyslap/${projectName}/readme`);
            
            if (!response.ok) {
                throw new Error('README не найден');
            }
            
            const data = await response.json();
            const readmeContent = atob(data.content);
            const htmlContent = parseMarkdown(readmeContent);
            modalBody.innerHTML = `<div class="readme-content">${htmlContent}</div>`;
            
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

function parseMarkdown(markdown) {
    let html = markdown;
    
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    html = html.split('\n\n').map(para => {
        if (!para.match(/^<(h\d|ul|ol|pre|li)/)) {
            return `<p>${para}</p>`;
        }
        return para;
    }).join('\n');
    
    return html;
}