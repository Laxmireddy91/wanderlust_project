// Bootstrap Validation
(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {

      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')

    }, false)
  })
})();


// Run after page loads
document.addEventListener("DOMContentLoaded", () => {

  const taxSwitch = document.getElementById("switchCheckDefault");
  const filters = document.querySelectorAll(".filter");
  const container = document.getElementById("listing-container");

  // ---------------------------
  // TAX TOGGLE SYSTEM
  // ---------------------------

  if (taxSwitch) {

    taxSwitch.addEventListener("change", () => {

      const taxInfo = document.querySelectorAll(".tax-info");

      taxInfo.forEach(info => {
        info.style.display = taxSwitch.checked ? "inline" : "none";
      });

    });

  }


  // ---------------------------
  // CATEGORY FILTER SYSTEM
  // ---------------------------

  filters.forEach(filter => {

    filter.addEventListener("click", async (e) => {

      e.preventDefault();

      const category = filter.dataset.category;

      // Highlight active filter
      filters.forEach(f => f.classList.remove("active"));
      filter.classList.add("active");

      try {

        const res = await fetch(`/listings?category=${category}`, {
          headers: { "Accept": "application/json" }
        });

        const listings = await res.json();

        container.innerHTML = "";

        listings.forEach(listing => {

          const showTax = taxSwitch && taxSwitch.checked ? "inline" : "none";

          container.innerHTML += `
            <div class="col">
              <a href="/listings/${listing._id}" class="listing-link">
                <div class="card listing-card">

                  <img 
                    src="${listing.image.url}"
                    class="card-img-top listing-img"
                    style="height:20rem"
                  />

                  <div class="card-body">
                    <h5>${listing.title}</h5>

                    <p>
                      ₹ ${listing.price} / night
                      <i class="tax-info" style="display:${showTax};">
                        +18% GST
                      </i>
                    </p>

                  </div>

                </div>
              </a>
            </div>
          `;

        });

      } catch (err) {
        console.log(err);
      }

    });

  });

});