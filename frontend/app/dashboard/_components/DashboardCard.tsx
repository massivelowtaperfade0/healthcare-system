"use client";
import Card from "./SummaryCard";

export default function DashboardCards({ cards }) {
  return (
    <div className="flex flex-wrap gap-10 transition-all duration-200">
      {cards.map(card => (
        <Card key={card.id} {...card} />
      ))}
    </div>
  );
}