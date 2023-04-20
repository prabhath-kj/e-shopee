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
              confirmButtonText: "OK",
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
            return;
          }
          Swal.fire({
            title: "Out of stock!",
            icon: "error",
            confirmButtonText: "OK",
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
              timer: 4000,
            }).then((result) => {
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
              }).then((result) => {
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
        swal.fire(
          "Out of Stock",
          "Some products in your cart are out of stock",
          "error"
        );
      } else {
        // Cart products have stock, redirect to checkout page
        window.location.href = "/checkout";
      }
    },
    error: (error) => {
      console.error(error);
      // Handle error if needed
    },
  });
}