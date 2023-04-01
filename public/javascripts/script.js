$(document).ready(function () {
  const addToCartLink = $("#add-to-cart");

  addToCartLink.click(function (event) {
    event.preventDefault();

    const productId = addToCartLink.data("product-id");

    $.get(`/add-to-cart/${productId}`)
      .done(function (response) {
        Swal.fire({
          title: "Product added to cart!",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .fail(function (error) {
        console.log(error);
      });
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
  $.ajax({
    url: "/change-product-quantity",
    method: "post",
    data: {
      product: arguments,
    },
    success: (response) => {
      console.log(response);
      location.reload();
    },
  });
}
