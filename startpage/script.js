function search() {
    const query = document.getElementById('search').value;
    if (query.trim() !== '') {
        window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    }
}
