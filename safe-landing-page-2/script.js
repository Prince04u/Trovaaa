document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('join-btn');
    
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        // The base64 encoded version of the private telegram link
        const encodedLink = 'aHR0cHM6Ly90Lm1lLytlNU1vTDFDNTNzb3daalZs';
        window.open(atob(encodedLink), '_blank');
    });
});
