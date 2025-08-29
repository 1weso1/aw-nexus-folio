import { ArrowUpRight, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  title: string;
  description: string;
  status: "live" | "progress" | "planned";
  role: string;
  date: string;
  tags: string[];
  link: string;
  image?: string;
}

const statusStyles = {
  live: "status-live",
  progress: "status-progress", 
  planned: "status-planned"
};

const statusLabels = {
  live: "Live",
  progress: "In Progress",
  planned: "Coming Soon"
};

export function ProjectCard({ 
  title, 
  description, 
  status, 
  role, 
  date, 
  tags, 
  link,
  image 
}: ProjectCardProps) {
  return (
    <div className="project-card group">
      {image && (
        <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-card/80 to-transparent" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-3">
        <span className={statusStyles[status]}>
          {statusLabels[status]}
        </span>
        <div className="flex items-center text-text-secondary text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          {date}
        </div>
      </div>

      <h3 className="text-xl font-bold font-sora mb-2 text-text-primary group-hover:text-neon-primary transition-colors">
        {title}
      </h3>
      
      <p className="text-text-secondary mb-3 font-medium text-sm">{role}</p>
      
      <p className="body-large mb-4 line-clamp-3">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span 
            key={tag}
            className="px-2 py-1 bg-neon-primary/10 text-neon-primary text-xs rounded-md border border-neon-primary/20"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <Button asChild variant="neon" size="sm">
          <Link to={link}>
            View Details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}