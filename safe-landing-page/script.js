document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.telegram-btn');
    
    // Add micro-interaction to the button
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.96)';
    });
    
    btn.addEventListener('mouseup', () => {
        btn.style.transform = 'scale(1.03) translateY(-3px)';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1) translateY(0)';
    });

    // Secure link redirection (Hidden from static bots)
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // This is the base64 encoded version of your private telegram link (https://t.me/+yTzj8acxwcVhOTM1)
        // By encoding it, Facebook bots cannot read the actual URL in the source code.
        const encodedLink = 'aHR0cHM6Ly90Lm1lLyt5VHpqOGFjeHdjVmhPVE0x';
        window.open(atob(encodedLink), '_blank');
    });
});
