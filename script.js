let allBooks = [];

const el = id => document.getElementById(id);

function transition(hide, show, onDone) {
    [hide, show].forEach(n => n.classList.remove('slide-fade-in', 'slide-fade-out'));
    hide.classList.add('slide-fade-out');
    setTimeout(() => {
        hide.style.display = 'none';
        onDone();
        show.classList.add('slide-fade-in');
    }, 500);
}

function loadFile() {
    const file = el('lua').files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        parseText(e.target.result);
        renderSidebar();

        const container = document.querySelector('.container');
        transition(el('introSection'), container, () => {
            container.style.display = 'flex';
            el('sidebar').style.display = 'block';
            el('backButton').style.display = 'block';
            el('sidebarHeader').style.display = 'none';
        });
    };
    reader.readAsText(file);
}

function mainPage() {
    const intro = el('introSection');
    transition(document.querySelector('.container'), intro, () => {
        intro.style.display = 'block';
        el('backButton').style.display = 'none';
        el('sidebarHeader').style.display = 'block';
        const sidebar = el('sidebar');
        sidebar.style.display = 'none';
        sidebar.innerHTML = '';
        el('content').innerHTML = '';
    });
}

function parseText(fullText) {
    allBooks = [];

    const ghi = fullText.match(/GHI_ItemData\s*=\s*\{([\s\S]*?)\n\}/);
    if (!ghi) {
        el('sidebar').innerHTML = 'Cannot find object';
        return;
    }

    const objects = ghi[1].matchAll(/\["([A-Za-z]+_\d+)"\]\s?=\s?\{([\s\S]*?)(?=\n\s*\["[A-Za-z]+_\d+"\]\s?=|\n?\}\s*,?\n?$)/g);

    for (const [, , block] of objects) {
        const name = block.match(/\["name"\]\s?=\s?"(.*?)"/)?.[1] ?? 'Nenalezeno';
        const creator = block.match(/\["creater"\]\s?=\s?"(.*?)"/)?.[1] ?? 'Nenalezeno';

        const pages = block
            .split(/},\s*-- \[\d+\]/)
            .map(section =>
                [...section.matchAll(/\["text(\d{1,2})"\]\s?=\s?"(.*?)"/g)]
                    .sort((a, b) => a[1] - b[1])
                    .map(m => m[2].replace(/\\r/g, '').replace(/\\n/g, '\n'))
                    .filter(t => t.trim())
                    .join('\n')
            )
            .filter(content => content.trim());

        allBooks.push({ name, creator, pages });
    }
}

function renderSidebar() {
    const sidebar = el('sidebar');
    sidebar.innerHTML = '';

    allBooks.forEach((book, index) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.textContent = book.name;
        item.onclick = () => {
            sidebar.querySelectorAll('.item.active').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            renderContent(index);
        };
        sidebar.appendChild(item);
    });

    if (allBooks.length) {
        sidebar.firstChild.classList.add('active');
        renderContent(0);
    }
}

function renderContent(index) {
    const book = allBooks[index];
    const pages = book.pages
        .map((text, i) => `<div class="page"><b>Stránka ${i + 1}:</b>\n${text}</div>`)
        .join('');

    el('content').innerHTML =
        `<h3>${book.name}</h3><p><i>Vytvořil: ${book.creator}</i></p>${pages}`;
}

function toggleTheme() {
    const dark = document.body.classList.toggle('dark-mode');
    el('themeToggle').textContent = dark ? '🌞' : '🌙';
}
