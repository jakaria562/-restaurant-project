
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

// Mobile navbar
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Navbar link click করলে menu বন্ধ হবে
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// Menu category filter
const filterButtons = document.querySelectorAll(".filter-btn");
const foodCards = document.querySelectorAll(".food-card");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const category = button.dataset.filter;

    foodCards.forEach(card => {
      const matches =
        category === "all" || card.dataset.category === category;

      card.style.display = matches ? "" : "none";
    });
  });
});

// Products
const products = {
  1: { name: "Garden Glow Salad", price: 480 },
  2: { name: "Chargrilled Steak", price: 1450 },
  3: { name: "Silky Alfredo Pasta", price: 690 },
  4: { name: "Golden Hour Spritz", price: 320 },
  5: { name: "Roasted Pumpkin Soup", price: 390 },
  6: { name: "Chocolate Cake", price: 360 }
};

const cartBar = document.getElementById("cartBar");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartDialog = document.getElementById("cartDialog");
const cartItems = document.getElementById("cartItems");
const dialogTotal = document.getElementById("dialogTotal");

let cart = {};

try {
  cart = JSON.parse(localStorage.getItem("skylineCart") || "{}");
  if (!cart || typeof cart !== "object" || Array.isArray(cart)) {
    cart = {};
  }

  // Invalid saved cart data বাদ দেওয়া
  Object.keys(cart).forEach(id => {
    if (!products[id] || !Number.isInteger(cart[id]) || cart[id] <= 0) {
      delete cart[id];
    }
  });
} catch {
  cart = {};
}

function money(amount) {
  return "৳ " + amount.toLocaleString("en-BD");
}

function totalItems() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function totalPrice() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    return sum + products[id].price * qty;
  }, 0);
}

function saveCart() {
  try {
    localStorage.setItem("skylineCart", JSON.stringify(cart));
  } catch {
    // Browser storage unavailable হলেও cart ব্যবহার করা যাবে।
  }
}

function updateCart() {
  const count = totalItems();
  const total = totalPrice();

  cartBar.hidden = count === 0;
  cartCount.textContent = `${count} item${count === 1 ? "" : "s"}`;
  cartTotal.textContent = money(total);
  dialogTotal.textContent = money(total);

  cartItems.replaceChildren();

  if (count === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "Your order is empty.";
    cartItems.appendChild(empty);
    return;
  }

  Object.entries(cart).forEach(([id, qty]) => {
    const product = products[id];

    const row = document.createElement("div");
    row.className = "cart-row";

    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = product.name;

    const price = document.createElement("small");
    price.textContent = `${money(product.price)} each`;

    info.append(title, price);

    const controls = document.createElement("div");
    controls.className = "cart-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Remove one item");

    const quantity = document.createElement("strong");
    quantity.textContent = String(qty);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Add one item");

    minus.addEventListener("click", () => changeQuantity(id, -1));
    plus.addEventListener("click", () => changeQuantity(id, 1));

    controls.append(minus, quantity, plus);
    row.append(info, controls);
    cartItems.appendChild(row);
  });
}

function changeQuantity(id, amount) {
  cart[id] = (cart[id] || 0) + amount;

  if (cart[id] <= 0) {
    delete cart[id];
  }

  saveCart();
  updateCart();
}

// Add to order buttons
document.querySelectorAll(".add-btn").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;

    changeQuantity(id, 1);
    button.textContent = "Added ✓";

    setTimeout(() => {
      button.textContent = "Add to Order +";
    }, 1000);
  });
});

// Open and close cart
document.getElementById("viewCart").addEventListener("click", () => {
  cartDialog.showModal();
});

document.getElementById("closeCart").addEventListener("click", () => {
  cartDialog.close();
});

// Demo checkout
document.getElementById("checkoutBtn").addEventListener("click", () => {
  cartDialog.close();
  alert("This is a demo website. Online checkout is not connected.");
});

cartDialog.addEventListener("click", event => {
  if (event.target === cartDialog) {
    cartDialog.close();
  }
});

// Reservation form
const bookingDate = document.getElementById("bookingDate");
const reservationForm = document.getElementById("reservationForm");
const formMessage = document.getElementById("formMessage");

const today = new Date();
const localToday = new Date(
  today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

bookingDate.min = localToday;

reservationForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!reservationForm.reportValidity()) return;

  const formData = new FormData(reservationForm);
  const name = formData.get("name").trim();
  const date = formData.get("date");
  const time = formData.get("time");
  const guests = formData.get("guests");

  formMessage.textContent =
    `Thank you, ${name}! Your demo request is for ${guests} guest(s), ` +
    `on ${date} at ${time}. No real booking was sent.`;

  reservationForm.reset();
  bookingDate.min = localToday;
});

// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Restore saved cart when page loads
updateCart();

// Scroll reveal animation
const revealElements = document.querySelectorAll(
  "section, .menu-card, .dish-card, .menu-item, .gallery-item"
);

revealElements.forEach((element) => {
  element.classList.add("reveal");
});

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

revealElements.forEach((element) => {
  observer.observe(element);
});
