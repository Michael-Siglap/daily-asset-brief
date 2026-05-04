"use client";
import FundamentalsPanel from "@/components/FundamentalsPanel";
import SearchModal from "@/components/SearchModal";
import { useUI } from "@/context/UIContext";

export default function GlobalModals() {
  const { searchOpen, closeSearch, openFundamentals, activeSymbol, closeFundamentals } = useUI();

  return (
    <>
      {searchOpen && (
        <SearchModal
          onClose={closeSearch}
          onViewFundamentals={(sym) => {
            closeSearch();
            openFundamentals(sym);
          }}
        />
      )}
      {activeSymbol && (
        <FundamentalsPanel
          symbol={activeSymbol}
          onClose={closeFundamentals}
        />
      )}
    </>
  );
}
