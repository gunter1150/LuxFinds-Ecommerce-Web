// js/script.js

(function($) {

    "use strict";

    // ... (kode searchPopup yang sudah ada) ...

    // --- LOGIKA KERANJANG BELANJA YANG DIPERBAIKI ---
    const Cart = {
        key: 'luxfinds_cart',

        // Mengambil item keranjang dari localStorage
        getItems: function() {
            const items = localStorage.getItem(this.key);
            return items ? JSON.parse(items) : [];
        },

        // Menyimpan item keranjang ke localStorage
        saveItems: function(items) {
            localStorage.setItem(this.key, JSON.stringify(items));
            this.updateCartCount(); // Perbarui jumlah item di UI
        },

        // Menambahkan produk ke keranjang
        // Fungsi ini sekarang menerima data produk langsung dari DOM
        addItem: function(productData) {
            let items = this.getItems();
            const existingItemIndex = items.findIndex(item => item.id === productData.id);

            if (existingItemIndex > -1) {
                // Jika produk sudah ada, update kuantitas
                items[existingItemIndex].quantity += 1; // Selalu tambahkan 1 dari tombol add to cart
            } else {
                // Jika produk belum ada, tambahkan baru
                items.push({
                    id: productData.id,
                    name: productData.name,
                    price: productData.price,
                    imageUrl: productData.imageUrl,
                    quantity: 1 // Selalu mulai dengan 1 kuantitas
                });
            }
            this.saveItems(items);
            alert(`${productData.name} telah ditambahkan ke keranjang!`); // Feedback sederhana
            console.log('Keranjang saat ini:', this.getItems());
        },

        // Menghapus produk dari keranjang
        removeItem: function(productId) {
            let items = this.getItems();
            items = items.filter(item => item.id !== productId);
            this.saveItems(items);
            // alert('Produk telah dihapus dari keranjang.'); // Opsional
            console.log('Keranjang saat ini:', this.getItems());
        },

        // Mengupdate kuantitas produk di keranjang
        updateItemQuantity: function(productId, newQuantity) {
            let items = this.getItems();
            const itemIndex = items.findIndex(item => item.id === productId);

            if (itemIndex > -1) {
                if (newQuantity <= 0) {
                    this.removeItem(productId); // Hapus jika kuantitas 0 atau kurang
                } else {
                    items[itemIndex].quantity = newQuantity;
                    this.saveItems(items);
                }
            }
            console.log('Keranjang saat ini:', this.getItems());
        },

        // Menghitung total harga keranjang
        calculateTotal: function() {
            const items = this.getItems();
            return items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },

        // Mengosongkan keranjang
        clearCart: function() {
            localStorage.removeItem(this.key);
            this.updateCartCount();
            console.log('Keranjang telah dikosongkan.');
        },

        // Memperbarui jumlah item di ikon keranjang (di header)
        updateCartCount: function() {
            const items = this.getItems();
            const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
            $('.cart-count').text(totalQuantity); // Asumsi ada elemen dengan class 'cart-count' di header
        }
    };

    // --- INISIALISASI SAAT DOCUMENT READY ---
    $(document).ready(function() {

        searchPopup();
        // initProductQty(); // Akan dipanggil ulang di cart.html setelah render item

        // Inisialisasi Swiper yang sudah ada
        // (kode Swiper Anda yang sudah ada tetap di sini)
        var swiperMain = new Swiper(".main-swiper", {
            speed: 500,
            navigation: {
                nextEl: ".swiper-arrow-prev",
                prevEl: ".swiper-arrow-next",
            },
        });

        var swiperProduct = new Swiper(".product-swiper", {
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

        var swiperWatch = new Swiper(".product-watch-swiper", {
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
        // Ini akan bekerja di index.html untuk produk-produk di swiper
        $('.product-item .add-to-cart-btn').on('click', function(e) {
            e.preventDefault();
            // Mendapatkan elemen product-item parent
            const $productItem = $(this).closest('.product-item');

            // Ekstrak data dari DOM
            const productId = $(this).data('product-id'); // Penting: pastikan ini ada di HTML!
            const productName = $productItem.find('.product-name').text(); // Pastikan ada class 'product-name'
            let productPrice = $productItem.find('.product-price-value').text(); // Pastikan ada class 'product-price-value'
            productPrice = parseFloat(productPrice.replace(/[^0-9.-]+/g, "")); // Hapus karakter non-angka dan ubah ke float
            const productImage = $productItem.find('.product-image').attr('src'); // Pastikan ada class 'product-image'

            if (!productId || !productName || isNaN(productPrice) || !productImage) {
                console.error('Gagal mendapatkan data produk dari DOM.', {
                    productId,
                    productName,
                    productPrice,
                    productImage
                });
                alert('Gagal menambahkan produk ke keranjang. Data produk tidak lengkap.');
                return;
            }

            const productData = {
                id: productId,
                name: productName,
                price: productPrice,
                imageUrl: productImage
            };

            Cart.addItem(productData);
        });

        // Inisialisasi jumlah item keranjang saat halaman dimuat (baik di index, cart, maupun checkout)
        Cart.updateCartCount();

    });

})(jQuery);