document.addEventListener('DOMContentLoaded', () => {
    setupFlipCards();
    setupButtons();
});

// ============================================================
// CẤU HÌNH (BẠN SỬA Ở ĐÂY)
// ============================================================
// Thay 'MÃ_FORM_CỦA_BẠN' bằng mã lấy từ Formspree (ví dụ: xmqbwjql)
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xgvglwzn"; 

// Số lần nút "Không" sẽ chạy trốn trước khi đứng yên
const MAX_ESCAPE_TIMES = 1; 
// ============================================================


// --- 1. XỬ LÝ LẬT ẢNH (CARD FLIP) ---
function setupFlipCards() {
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Thêm class .flipped để CSS thực hiện xoay 3D
            card.classList.toggle('flipped');
        });
    });
}


// --- 2. XỬ LÝ CÁC NÚT BẤM ---
function setupButtons() {
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const message = document.getElementById('message');
    
    // Biến đếm số lần nút "Không" đã chạy
    let escapeCount = 0;

    // --- A. LOGIC NÚT ĐỒNG Ý (YES) ---
    btnYes.addEventListener('click', () => {
        // 1. Hiệu ứng UI
        message.style.display = 'block';
        message.innerHTML = "Tuyệt vời! Anh sẽ đón em đi nhé! ❤️🎉";
        message.className = "hidden-message success-msg"; // Style xanh/hồng
        
        btnYes.innerHTML = "Đã chốt đơn! ❤️";
        btnYes.style.backgroundColor = "#ff4081";
        btnYes.disabled = true; // Khóa nút
        
        // Ẩn nút No đi cho đỡ vướng
        btnNo.style.display = 'none';

        // 2. Bắn pháo hoa
        createConfetti();

        // 3. Gửi mail báo cáo
        sendResponseToEmail("YES - Cô ấy đã ĐỒNG Ý! Chúc mừng bro!");
    });


    // --- B. LOGIC NÚT TỪ CHỐI (NO) - CLICK ---
    // (Chỉ click được khi nó đã ngừng chạy)
    btnNo.addEventListener('click', () => {
        if (escapeCount >= MAX_ESCAPE_TIMES) {
            // 1. Hiệu ứng UI buồn
            message.style.display = 'block';
            message.innerHTML = "Tiếc quá... Nhưng anh vẫn tôn trọng quyết định của em 😢";
            message.style.color = "#757575"; // Màu xám
            
            btnNo.innerHTML = "Đã từ chối 💔";
            btnNo.style.backgroundColor = "#9e9e9e";
            btnNo.disabled = true;
            btnYes.disabled = true; // Khóa luôn nút Yes

            // 2. Gửi mail báo cáo buồn
            sendResponseToEmail("NO - Cô ấy TỪ CHỐI rồi. Chia buồn nhé :(");
        }
    });


    // --- C. LOGIC NÚT TỪ CHỐI - CHẠY TRỐN (ESCAPE) ---
    const moveButtonLogic = (e) => {
        // Nếu đã chạy đủ số lần quy định thì dừng lại (return)
        if (escapeCount >= MAX_ESCAPE_TIMES) {
            return;
        }

        // Ngăn chặn hành động click mặc định trên điện thoại (để không bị bấm nhầm)
        if (e && e.type === 'touchstart') {
            e.preventDefault();
        }

        // Tính toán vị trí mới ngẫu nhiên
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Trừ biên an toàn để nút không bị nhảy ra ngoài màn hình
        const btnWidth = btnNo.offsetWidth;
        const btnHeight = btnNo.offsetHeight;
        
        const randomX = Math.random() * (screenWidth - btnWidth - 20);
        const randomY = Math.random() * (screenHeight - btnHeight - 20);

        // Gán vị trí mới
        btnNo.style.position = 'fixed'; // Quan trọng: phải là fixed để chạy khắp màn hình
        btnNo.style.left = randomX + 'px';
        btnNo.style.top = randomY + 'px';
        btnNo.style.zIndex = '1000'; // Đảm bảo nổi lên trên các ảnh
        
        // Tăng biến đếm
        escapeCount++;
    };

    // Gán sự kiện cho Desktop (Di chuột vào là chạy)
    btnNo.addEventListener('mouseover', moveButtonLogic);
    
    // Gán sự kiện cho Mobile - Xiaomi 12T (Chạm vào là chạy)
    // { passive: false } là quan trọng để e.preventDefault() hoạt động tốt trên Chrome Mobile
    btnNo.addEventListener('touchstart', moveButtonLogic, { passive: false });
}


// --- 3. HÀM GỬI MAIL (Fetch API) ---
function sendResponseToEmail(content) {
    // Nếu chưa thay mã Formspree thì cảnh báo console
    if (FORMSPREE_ENDPOINT.includes("MÃ_FORM_CỦA_BẠN")) {
        console.warn("Chưa cấu hình Formspree ID trong script.js!");
        return;
    }

    fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            message: content,                  // Nội dung: YES hay NO
            timestamp: new Date().toLocaleString('vi-VN'), // Thời gian
            deviceInfo: navigator.userAgent    // Thiết bị (Check xem có đúng là Xiaomi 12T ko)
        })
    })
    .then(response => {
        if (response.ok) {
            console.log("Đã gửi kết quả thành công!");
        } else {
            console.log("Lỗi gửi form.");
        }
    })
    .catch(error => console.error("Lỗi mạng:", error));
}


// --- 4. HIỆU ỨNG PHÁO GIẤY (CONFETTI) ---
function createConfetti() {
    const colors = ['#ff758c', '#ff7eb3', '#ffd700', '#4CAF50', '#2196F3'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti'); // Cần CSS class .confetti nếu muốn tùy biến thêm
        
        // Style trực tiếp
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '9999';
        
        // Animation rơi tự do
        const duration = Math.random() * 3 + 2; // 2s - 5s
        confetti.style.transition = `top ${duration}s ease-out, transform ${duration}s linear`;
        
        document.body.appendChild(confetti);

        // Kích hoạt animation
        setTimeout(() => {
            confetti.style.top = '110vh'; // Rơi quá màn hình
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 50);

        // Dọn dẹp DOM sau khi rơi xong
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}
// --- 5. HÀM CUỘN TRANG (Bổ sung) ---
function scrollToMemories() {
    const memoriesSection = document.getElementById('memories');
    if (memoriesSection) {
        memoriesSection.scrollIntoView({ behavior: 'smooth' });
    }
}