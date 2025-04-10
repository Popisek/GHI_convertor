let allBooks = [];

function loadLuaFile() {
    const fileInput = document.getElementById('luaFile');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        parseLua(e.target.result);
        renderSidebar();
        document.querySelector('.container').style.display = 'flex';
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById('introSection').style.display = 'none';
        document.getElementById('backButton').style.display = 'block';
        document.getElementById('sidebarHeader').style.display = 'none';
    };
    reader.readAsText(file);
}

function goBack() {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('introSection').style.display = 'block';
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('sidebarHeader').style.display = 'block';
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('sidebar').innerHTML = '';
    document.getElementById('content').innerHTML = '';
}

function parseLua(fullText) {
    allBooks = [];
    const ghiMatch = fullText.match(/GHI_ItemData\s*=\s*\{([\s\S]*?)\n\}/);
    if (!ghiMatch) {
        document.getElementById('sidebar').innerHTML = 'Nepodařilo se najít GHI_ItemData = {...}';
        return;
    }

    const luaText = ghiMatch[1];
    const objectRegex = /\["([A-Za-z]+_\d+)"\]\s?=\s?\{([\s\S]*?)(?=\n\s*\["[A-Za-z]+_\d+"\]\s?=|\n?\}\s*,?\n?$)/g;
    let match;

    while ((match = objectRegex.exec(luaText)) !== null) {
        const block = match[2];

        const nameMatch = block.match(/\["name"\]\s?=\s?"(.*?)"/);
        const creatorMatch = block.match(/\["creater"\]\s?=\s?"(.*?)"/);

        const name = nameMatch ? nameMatch[1] : "Nenalezeno";
        const creator = creatorMatch ? creatorMatch[1] : "Nenalezeno";

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
        item.textContent = `${book.name}   |   Vytvořil: ${book.creator}`;
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
