export type CardContent = {
  email: string | null;
  bio: string;
  role: string | null;
  city: string | null;
  interests: string[];
  is_active: boolean;
};

export type ProfileCardData = CardContent & {
  display_name: string;
  avatar_url: string | null;
  updated_at: string | null;
  dateLabel?: "Joined" | "Updated";
};
