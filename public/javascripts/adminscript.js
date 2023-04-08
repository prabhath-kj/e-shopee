function generateCouponCode() {
  // Logic for generating the coupon code
  var couponCode = "COUPON" + Math.floor(Math.random() * 10000); // Generate a random number for the coupon code
  document.getElementById("couponCode").value = couponCode;
}

function autoGenerateMaxDiscount() {
  var discount = document.getElementById("couponDiscount").value;
  var maxDiscount = discount * 10; // Change this calculation as per your requirement
  document.getElementById("maxDiscount").value = maxDiscount;
}
function checkForErrors() {
  let couponCode = document.getElementById("couponCode").value;
  let couponDiscount = document.getElementById("couponDiscount").value;
  let maxDiscount = document.getElementById("maxDiscount").value;
  let expiryDate = document.querySelector("#expiryDate").value;

  // Example validation: check if fields are empty
  if (!couponCode || !couponDiscount || !maxDiscount) {
    document.getElementById("addCouponError").textContent =
      "All fields are required.";
    return;
  }

  // Example validation: check if couponDiscount is greater than maxDiscount
  if (parseInt(couponDiscount) > parseInt(maxDiscount)) {
    document.getElementById("addCouponError").textContent =
      "Coupon discount cannot be greater than maximum discount.";
    return;
  }

  // If validation passes, submit the form
  submitCoupon(couponCode, couponDiscount, expiryDate, maxDiscount);
}

function submitCoupon(code, discount, expiryDate, maxDiscount) {
  $.ajax({
    url: "/admin/add-coupon",
    method: "post",
    data: {
      couponCode: code,
      couponDiscount: discount,
      expiryDate: expiryDate,
      maxDiscount: maxDiscount,
    },
    success: (response) => {
      if (response.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Coupon added Successfully",
        }).then((result) => {
          location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Coupon added already!",
        });
      }
    },
  });
}
