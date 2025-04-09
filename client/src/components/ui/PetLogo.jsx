import React from "react";

export default function PetLogo() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "10px",
      }}
    >
      <img
        src="https://i.pinimg.com/736x/11/af/87/11af87e8690f61773f2b33aff802009e.jpg"
        alt="pet-finder"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "3px solid #001529",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
}
