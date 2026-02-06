import React from "react";
import "../../style/Products.css";

// Liste fixe de catégories pour la sidebar catalogue.
const SIDEBAR_CATEGORIES = [
  { label: "Catalogue", value: null },
  { label: "Informatique", value: "informatique" },
  { label: "Vêtements", value: "vetements" },
  { label: "Sports", value: "sports" },
];

/**
 * Sidebar catalogue.
 *
 * - Filtre par catégorie (boutons)
 * - Filtre par prix max via un slider (contrôle type "volume")
 *
 * Toute la logique de filtrage réelle reste gérée dans la page `Products`,
 * ce composant se limite à l'affichage et à remonter les événements.
 */
export default function Filters({
  selectedCategory,
  onCategoryChange,
  priceMax,
  onPriceMaxChange,
  maxPriceRange = 1000000,
}) {
  const handleSliderChange = (e) => {
    const val = e.target.value === "" ? null : Number(e.target.value);
    onPriceMaxChange(val);
  };

  return (
    <div className="card border-0 shadow-sm sticky-top catalogue-sidebar">
      <div className="card-body">
        <h6 className="fw-bold mb-3">Catégories</h6>
        <ul className="list-unstyled mb-4">
          {SIDEBAR_CATEGORIES.map(({ label, value }) => {
            const isSelected =
              (value == null && selectedCategory == null) ||
              selectedCategory === value;

            return (
              <li key={label} className="mb-2">
                <button
                  type="button"
                  className={`btn btn-sm w-100 text-start ${
                    isSelected ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => onCategoryChange(value)}
                >
                  {value == null ? "Toutes" : label}
                </button>
              </li>
            );
          })}
        </ul>

        <h6 className="fw-bold mb-3">Prix max (FCFA)</h6>
        <div className="price-slider-wrap">
          <input
            type="range"
            className="form-range price-slider"
            min={0}
            max={maxPriceRange}
            step={1000}
            value={priceMax ?? maxPriceRange}
            onChange={handleSliderChange}
          />
          <div className="d-flex justify-content-between small text-muted mt-1">
            <span>0</span>
            <span>
              {priceMax != null ? `${(priceMax / 1000).toFixed(0)}k` : "Max"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
