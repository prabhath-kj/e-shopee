$(document).ready(function () {
  const addToCartLink = $("#add-to-cart");

  addToCartLink.click(function (event) {
    event.preventDefault();

    const user = addToCartLink.data("user-id");
    if (user) {
      const productId = addToCartLink.data("product-id");

      $.get(`/add-to-cart/${productId}`)
        .done(function (response) {
          if (response.status) {
            Swal.fire({
              title: "Product added to cart!",
              icon: "success",
              showConfirmButton: false,
              timer: 2000,
            }).then(() => {
              location.reload();
            });
            return;
          }
          Swal.fire({
            title: "Out of stock!",
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        })
        .fail(function (error) {
          console.log(error);
        });
    } else {
      // User is not logged in, redirect to login page
      window.location.href = "/login";
      return;
    }
  });
});

function removeCartProduct(cartId, productId, productName) {
  Swal.fire({
    title: `Are you sure you want to remove ${productName} from the cart?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, remove it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/remove-product-from-cart",
        data: {
          cart: cartId,
          product: productId,
          productName: productName,
        },
        method: "post",
        success: (response) => {
          if (response) {
            Swal.fire({
              title: `Product removed from cart!`,
              icon: "success",
              timer: 2000,
            }).then(() => {
              location.reload();
            });
          }
        },
      });
    }
  });
}
function removeFromWishList(product_id) {
  Swal.fire({
    title: `Are you sure you want to remove?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, remove it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/remove-product-from-wishList",
        data: {
          product: product_id,
        },
        method: "delete",
        success: (response) => {
          if (response) {
            Swal.fire({
              title: `Product removed !`,
              icon: "success",
              showConfirmButton: false,
              timer: 2000,
            }).then(() => {
              location.reload();
            });
          }
        },
      });
    }
  });
}
function changeQuantity() {
  if (parseInt(arguments[3]) + parseInt(arguments[2]) == 0) {
    Swal.fire({
      title: "Are you sure,want to remove?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/change-product-quantity",
          method: "post",
          data: {
            product: arguments,
          },
          success: (response) => {
            if (response) {
              Swal.fire({
                title: `Product removed from cart!`,
                icon: "success",
                timer: 4000,
              }).then(() => {
                location.reload();
              });
            }
          },
        });
      }
    });
  } else {
    $.ajax({
      url: "/change-product-quantity",
      method: "post",
      data: {
        product: arguments,
      },
      success: (response) => {
        if (response.status) {
          location.reload();
        } else {
          Swal.fire({
            title: "Out of stock!",
            icon: "error",
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              location.reload();
            }
          });
          return;
        }
      },
    });
  }
}

function addToCartFromWish(user_id, product_id) {
  if (user_id) {
    $.ajax({
      url: `/add-to-cartFromWishL/${product_id}`,
      method: "PUT",
      success: function (response) {
        if (response.status) {
          Swal.fire({
            title: "Product added to cart!",
            icon: "success",
            showConfirmButton: false,
            timer: 4000,
          }).then(() => {
            location.reload();
          });
        } else {
          Swal.fire({
            title: "Out of stock!",
            icon: "error",
            showConfirmButton: false,
            timer: 4000,
          });
        }
      },
      error: function (error) {
        console.log(error);
      },
    });
  } else {
    // User is not logged in, redirect to login page
    window.location.href = "/login";
  }
}

function cancelOrder() {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3cc75c",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Cancel The Order!",
    input: "text", // Add a text input field for cancel reason
    inputPlaceholder: "Enter cancel reason", // Placeholder for the input field
  }).then((result) => {
    if (result.isConfirmed) {
      const cancelReason = result.value; // Get the value entered in the input field
      $.ajax({
        url: "/cancelOrder",
        data: {
          arguments,
          cancelReason: cancelReason, // Pass the cancel reason as data in the Ajax request
        },
        method: "post",
        success: (response) => {
          if (response.status) {
            Swal.fire({
              title: `Cancelled`,
              icon: "success",
              timer: 4000,
            }).then((response) => {
              if (response.isConfirmed) {
                location.reload();
              }
            });
          }
        },
      });
    }
  });
}

function returnOrder(orderId) {
  Swal.fire({
    icon: "warning",
    title: "Are you sure",
    text: "You won't be able to revert this!",
    showDenyButton: true,
    confirmButtonText: "Yes, Return",
    denyButtonText: `No`,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Reason for returning",
        input: "text",
        inputValue: "",
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          const return_reason = result.value;
          $.ajax({
            url: "/returnOrder",
            method: "put",
            data: {
              orderId: orderId,
              reason: return_reason,
            },
            success: (response) => {
              if (response.status) {
                Swal.fire("Returned!", "", "success").then(() => {
                  location.reload();
                });
              } else {
                Swal.fire(
                  "The Product Return validity expired",
                  "",
                  "warning"
                ).then(() => {});
              }
            },
          });
        }
      });
    }
  });
}

//coupon

function applyCoupon(total) {
  let couponCode = document.getElementById("couponCode").value;
  document.getElementById("couponCodeInput").value = couponCode;

  $.ajax({
    url: "/apply-coupon",
    data: {
      code: couponCode,
      total: total,
    },
    method: "post",
    success: (response) => {
      console.log(response.couponCode, "Response in ajax script");
      if (response.status) {
        const couponDisAmount = document.getElementById("couponDisAmount");
        couponDisAmount.innerHTML = "-" + response.disAmount;
        $("#couponSuccess").html("Coupon added");
        document.getElementById("totalPrice").innerHTML =
          "&#x20B9;" + response.disPrice;
        document.getElementById("paypalAmount").value = response.disPrice;
      } else {
        $("#couponErr").html("Invalid Coupon");
        document.getElementById("couponSuccess").innerHTML = "";
      }
    },
  });
}

$(document).ready(function () {
  $("#myTable").DataTable();
});

function checkOut() {
  $.ajax({
    url: "/checkout",
    method: "get",
    success: (response) => {
      if (response.items === false) {
        // Cart products are out of stock
        swal.fire({
          title: "Out of Stock",
          text: "Some products in your cart are out of stock",
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
      } else if (response.items === null) {
        // Cart is empty
        swal.fire({
          title: "Add products",
          text: "There is no products in your cart for checkout",
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        // Cart products have stock, redirect to checkout page
        window.location.href = "/checkout";
      }
    },
    error: (error) => {
      console.error(error);
      // Handle error if needed
      swal.fire({
        title: "Error",
        text: "There was an error processing your request",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    },
  });
}

function AddToWishList(id, user_id) {
  if (!user_id) {
    window.location.href = "/login";
    return;
  }
  // Make an AJAX request to add the product to the wishlist
  $.ajax({
    type: "post",
    url: `/wishlist/add/`,
    data: {
      product_id: id,
    },
    success: function (response) {
      if (response.removeSuccess) {
        // If the product was already in the wishlist and was removed, show a Sweet Alert with a trash popup
        Swal.fire({
          icon: "success",
          title: "Product removed from wishlist",
          html: '<div class="trash-popup"><i class="fas fa-trash"></i></div>',
          showConfirmButton: false,
          timer: 2000,
          onOpen: function () {
            // Animate the trash popup
            anime({
              targets: ".trash-popup",
              scale: [0.5, 1],
              opacity: [0, 1],
              easing: "easeOutCirc",
              duration: 800,
            });
          },
        }).then(() => {
          location.reload();
        });
      } else {
        // If the product was added to the wishlist, show a Sweet Alert with a heart popup
        Swal.fire({
          icon: "success",
          title: "Product added to wishlist",
          html: '<div class="heart-popup"><i class="fas fa-heart"></i></div>',
          showConfirmButton: false,
          timer: 2000,
          onOpen: function () {
            // Animate the heart popup
            anime({
              targets: ".heart-popup",
              scale: [0.5, 1],
              opacity: [0, 1],
              easing: "easeOutCirc",
              duration: 800,
            });
          },
        }).then(() => {
          location.reload();
        });
      }
    },
    error: function (xhr, status, error) {
      // If the request fails, show an error message
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    },
  });
}

// Example client-side code to update cart and wishlist counts
function updateCounts() {
  // Update cart count
  $.get("/cart/count", function (data) {
    let cartCount = data.count;
    $("#cart-badge").html(cartCount);
  });

  // Update wishlist count
  $.get("/wishlist/count", function (data) {
    let wishlistCount = data.count;
    $(".wishlist-count").html(wishlistCount);
  });
}

// Call updateCounts function on page load and after adding/removing items from cart or wishlist
$(document).ready(function () {
  updateCounts();
});

$(document).on("cartUpdated wishlistUpdated", function () {
  updateCounts();
});

//news letter
function isValidEmail(email) {
  // Use a regular expression to check if the email address is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function handleSubscription(event) {
  event.preventDefault(); // prevent the form from submitting normally

  // Get the user's email address from the input field
  const email = document.querySelector('input[type="email"]').value;

  if (!isValidEmail(email)) {
    Swal.fire({
      icon: "error",
      title: "Invalid Email Address",
      text: "Please enter a valid email address.",
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }
  // Show a SweetAlert message to confirm subscription
  Swal.fire({
    icon: "success",
    title: "Subscribed!",
    text: "Thank you for subscribing!",
    showConfirmButton: false,
    timer: 2000,
  });
}


//search form 
function validateForm() {
  var searchInput = document.getElementById("product-search").value;
  if (searchInput == "") {
    return false;
  } else {
    return true;
  }
}
