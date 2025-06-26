(function($) {
    "use strict";

    // --- DEFINISI OBJEK CART ---
    // Pastikan objek Cart ini ada dan terdefinisi dengan benar di script.js
    // dan method-methodnya berinteraksi dengan localStorage
    window.Cart = {
        // Mengambil semua item dari localStorage
        getItems: function() {
            const items = localStorage.getItem('cartItems');
            try {
                // Return array kosong jika belum ada atau parsing gagal
                return items ? JSON.parse(items) : [];
            } catch (e) {
                console.error("Error parsing cartItems from localStorage:", e);
                // Penting: Kembalikan array kosong agar aplikasi tidak crash
                return []; 
            }
        },

        // Menambahkan item ke keranjang
        addItem: function(productId, quantity = 1) {
            let items = this.getItems(); // Dapatkan item yang ada
            const existingItemIndex = items.findIndex(item => item.id === productId);

            if (existingItemIndex > -1) {
                // Jika item sudah ada, tambahkan kuantitasnya
                items[existingItemIndex].quantity += quantity;
            } else {
                // Jika item baru, tambahkan ke array
                items.push({ id: productId, quantity: quantity });
            }
            // Simpan kembali ke localStorage
            localStorage.setItem('cartItems', JSON.stringify(items));
            console.log(`[Cart.js] Item ${productId} added. Current cart:`, this.getItems());
            this.updateCartCount(); // Perbarui badge keranjang di header
        },

        // Menghapus item dari keranjang
        removeItem: function(productId) {
            let items = this.getItems();
            items = items.filter(item => item.id !== productId); // Filter keluar item yang dihapus
            localStorage.setItem('cartItems', JSON.stringify(items));
            console.log(`[Cart.js] Item ${productId} removed. Current cart:`, this.getItems());
            this.updateCartCount();
        },

        // Memperbarui kuantitas item
        updateItemQuantity: function(productId, newQuantity) {
            let items = this.getItems();
            const itemIndex = items.findIndex(item => item.id === productId);

            if (itemIndex > -1) {
                if (newQuantity <= 0) { 
                    // Hapus item jika kuantitasnya 0 atau kurang
                    items.splice(itemIndex, 1);
                } else {
                    // Update kuantitas
                    items[itemIndex].quantity = newQuantity;
                }
            }
            localStorage.setItem('cartItems', JSON.stringify(items));
            console.log(`[Cart.js] Item ${productId} quantity updated to ${newQuantity}. Current cart:`, this.getItems());
            this.updateCartCount();
        },

        // Mengosongkan seluruh keranjang
        clearCart: function() {
            localStorage.removeItem('cartItems'); // Hapus key cartItems dari localStorage
            console.log("[Cart.js] Cart cleared.");
            this.updateCartCount();
        },

        // Memperbarui jumlah item di badge keranjang (misalnya di header)
        updateCartCount: function() {
            const cartItems = this.getItems();
            // Hitung total kuantitas dari semua item
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0); 
            // Asumsi ada elemen dengan ID 'cart-count' di header untuk menampilkan jumlah
            $('#cart-count').text(totalItems); 
            console.log("[Cart.js] Cart count updated to:", totalItems);
        }
    };

    // --- FUNGSI FORMAT RUPIAH ---
    window.formatRupiah = function(angka) {
        let reverse = angka.toString().split('').reverse().join('');
        let ribuan = reverse.match(/\d{1,3}/g);
        let hasil = ribuan.join('.').split('').reverse().join('');
        return 'Rp' + hasil;
    };

    // --- FUNGSI UTAMA (INIT) ---
    $(document).ready(function() {
        // Panggil fungsi Cart.updateCartCount() saat DOM siap untuk inisialisasi badge
        if (typeof window.Cart !== 'undefined' && typeof window.Cart.updateCartCount === 'function') {
            window.Cart.updateCartCount(); 
        } else {
            console.error("Cart object or updateCartCount method is not defined in script.js on document ready.");
        }

        // --- Event listener untuk tombol "Add to Cart" di halaman produk (index.html atau detail produk) ---
        // Asumsi tombol Add to Cart memiliki class 'add-to-cart-btn' dan data-product-id
        $('.add-to-cart-btn').on('click', function(e) {
            e.preventDefault();
            const productId = $(this).data('product-id');
            // Asumsi input kuantitas ada di dekat tombol, atau default ke 1
            const quantity = parseInt($(this).closest('.product-item').find('.quantity-input').val() || 1); 
            
            if (productId && typeof window.Cart !== 'undefined' && typeof window.Cart.addItem === 'function') {
                window.Cart.addItem(productId, quantity);
                alert('Produk berhasil ditambahkan ke keranjang!'); // Feedback visual
                console.log(`[index.html] Product ${productId} added to cart.`);
            } else {
                console.error("[index.html] Failed to add item: Product ID missing or Cart object/addItem method not defined.");
            }
        });

        // --- Inisialisasi plugin atau fungsionalitas UI lainnya ---
        // (Pastikan kode ini dari template Anda ada di sini)
        var searchPopup = function() {
            var searchBtn = $( '.search-button' );
            var searchPopup = $( '.search-popup' );
            var searchClose = $( '.close-button' );

            searchBtn.on( 'click', function(e) {
                e.preventDefault();
                searchPopup.toggleClass('active');
            });

            searchClose.on( 'click', function(e) {
                e.preventDefault();
                searchPopup.removeClass('active');
            });
        };

        var initProductQty = function(){
            $(document).on('click', '.qty-count', function(){
                var $parent = $(this).parents('.product-quantity');
                var $target = $parent.find('.quantity-input');
                var currentVal = parseInt($target.val());
                if($(this).hasClass('minus-button')){
                    if ( currentVal > 1) {
                        $target.val(currentVal - 1);
                    }
                } else {
                    $target.val(currentVal + 1);
                }
            });
        };

        searchPopup();
        initProductQty();

        var swiper = new Swiper(".main-swiper", {
            speed: 500,
            navigation: {
                nextEl: ".swiper-arrow-prev",
                prevEl: ".swiper-arrow-next",
            },
        });         

        var swiper = new Swiper(".product-swiper", {
            slidesPerView: 4,
            spaceBetween: 10,
            pagination: {
                el: "#mobile-products .swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                0: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                980: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                }
            },
        });      

        var swiper = new Swiper(".product-watch-swiper", {
            slidesPerView: 4,
            spaceBetween: 10,
            pagination: {
                el: "#smart-watches .swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                0: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                980: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                }
            },
        }); 


        // --- Event Listener untuk "Tambahkan ke Keranjang" ---
        $('.add-to-cart-btn').off('click').on('click', function(e) {
        e.preventDefault();
        const productId = $(this).data('product-id'); // Asumsi ada data-product-id di tombol
        const quantity = parseInt($('#product-quantity').val() || 1); // Asumsi ada input quantity
        
        if (typeof window.Cart !== 'undefined') {
            window.Cart.addItem(productId, quantity);
            console.log(`Product ${productId} added to cart! Current cart:`, window.Cart.getItems());
            alert('Product added to cart!'); // Untuk feedback visual
        } else {
            console.error("Cart object is not defined when trying to add item.");
        }
    });
        Cart.updateCartCount();
    });

    

})(jQuery);