let allBooks = [];

function loadFile() {
    const fileInput = document.getElementById('lua');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        parseText(e.target.result);
        renderSidebar();

        const intro = document.getElementById('introSection');
        const container = document.querySelector('.container');

        intro.classList.remove('slide-fade-in', 'slide-fade-out');
        container.classList.remove('slide-fade-in', 'slide-fade-out');

        intro.classList.add('slide-fade-out');

        setTimeout(() => {
            intro.style.display = 'none';

            container.style.display = 'flex';
            container.classList.add('slide-fade-in');

            document.getElementById('sidebar').style.display = 'block';
            document.getElementById('backButton').style.display = 'block';
            document.getElementById('sidebarHeader').style.display = 'none';
        }, 500);
    };
    reader.readAsText(file);
}

function mainPage() {
    const intro = document.getElementById('introSection');
    const container = document.querySelector('.container');

    intro.classList.remove('slide-fade-in', 'slide-fade-out');
    container.classList.remove('slide-fade-in', 'slide-fade-out');

    container.classList.add('slide-fade-out');

    setTimeout(() => {
        container.style.display = 'none';

        intro.style.display = 'block';
        intro.classList.add('slide-fade-in');

        document.getElementById('backButton').style.display = 'none';
        document.getElementById('sidebarHeader').style.display = 'block';
        document.getElementById('sidebar').style.display = 'none';
        document.getElementById('sidebar').innerHTML = '';
        document.getElementById('content').innerHTML = '';
    }, 500);
}

function parseText(fullText) {
    allBooks = [];
    const ghi = fullText.match(/GHI_ItemData\s*=\s*\{([\s\S]*?)\n\}/);
    if (!ghi) {
        document.getElementById('sidebar').innerHTML = 'Cannot find object';
        return;
    }

    const txt = ghi[1];
    const object = /\["([A-Za-z]+_\d+)"\]\s?=\s?\{([\s\S]*?)(?=\n\s*\["[A-Za-z]+_\d+"\]\s?=|\n?\}\s*,?\n?$)/g;
    let loop;

    while ((loop = object.exec(txt)) !== null) {
        const block = loop[2];

        const nameId = block.match(/\["name"\]\s?=\s?"(.*?)"/);
        const creatorId = block.match(/\["creater"\]\s?=\s?"(.*?)"/);

        const name = nameId ? nameId[1] : "Nenalezeno";
        const creator = creatorId ? creatorId[1] : "Nenalezeno";

        const pageSections = block.split(/},\s*-- \[\d+\]/);
        let pages = [];

        for (let section of pageSections) {
            let texts = [...section.matchAll(/\["text(\d{1,2})"\]\s?=\s?"(.*?)"/g)]
                .sort((a, b) => parseInt(a[1]) - parseInt(b[1]))
                .map(m => m[2].replace(/\\r/g, '').replace(/\\n/g, '\n'));
            let pageContent = texts.filter(t => t.trim()).join('\n');
            if (pageContent.trim()) {
                pages.push(pageContent);
            }
        }

        allBooks.push({ name, creator, pages });
    }
}

function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';

    allBooks.forEach((book, index) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.textContent = `${book.name}`;
        item.onclick = () => {
            document.querySelectorAll('.list-panel .item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            renderContent(index);
        };
        sidebar.appendChild(item);
    });

    if (allBooks.length > 0) {
        sidebar.firstChild.classList.add('active');
        renderContent(0);
    }
}

function renderContent(index) {
    const content = document.getElementById('content');
    const book = allBooks[index];

    let pagesHtml = book.pages.map((text, idx) =>
        `<div class="page"><b>Stránka ${idx + 1}:</b>\n${text}</div>`
    ).join('');

    content.innerHTML = `<h3>${book.name}</h3><p><i>Vytvořil: ${book.creator}</i></p>${pagesHtml}`;
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle("dark-mode");

    const button = document.getElementById("themeToggle");
    button.textContent = body.classList.contains("dark-mode") ? "🌞" : "🌙";
}
