$(document).ready(function () {
  const addToCartLink = $("#add-to-cart");

  addToCartLink.click(function (event) {
    event.preventDefault();

    const productId = addToCartLink.data("product-id");

    $.get(`/add-to-cart/${productId}`)
      .done(function (response) {
        alert("Product added to Cart");
        location.reload();
      })
      .fail(function (error) {
        console.log(error);
      });
  });
});
