import {
  BedDouble,
  Briefcase,
  Building2,
  GraduationCap,
  Scissors,
  Stethoscope,
  Store,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

interface RubroIconProps {
  iconName: string;
  className?: string;
}

export function RubroIcon({ iconName, className = "h-5 w-5" }: RubroIconProps) {
  switch (iconName) {
    case "UtensilsCrossed":
      return <UtensilsCrossed className={className} />;
    case "Stethoscope":
      return <Stethoscope className={className} />;
    case "Scissors":
      return <Scissors className={className} />;
    case "Wrench":
      return <Wrench className={className} />;
    case "Store":
      return <Store className={className} />;
    case "Building2":
      return <Building2 className={className} />;
    case "GraduationCap":
      return <GraduationCap className={className} />;
    case "BedDouble":
      return <BedDouble className={className} />;
    default:
      return <Briefcase className={className} />;
  }
}
