import { MapPin, Building2, DollarSign, Clock, ExternalLink } from 'lucide-react';

const JobCard = ({ job, onApply }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {job.title}
          </h3>
          {job.company_name && (
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <Building2 className="h-4 w-4 mr-2" />
              <span>{job.company_name}</span>
            </div>
          )}
        </div>
        {job.salary_min && (
          <div className="flex items-center text-accent font-semibold">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>
              {job.salary_min}
              {job.salary_max && ` - ${job.salary_max}`}
            </span>
          </div>
        )}
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.location_city && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.location_city}{job.location_country && `, ${job.location_country}`}</span>
          </div>
        )}
        {job.employment_type && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span className="capitalize">{job.employment_type.replace('-', ' ')}</span>
          </div>
        )}
        {job.remote_type === 'remote' && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
            Remote
          </span>
        )}
      </div>

      {job.required_skills && job.required_skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.required_skills.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        {job.application_url ? (
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center space-x-2"
          >
            <span>Apply Now</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <button 
            onClick={() => onApply && onApply(job)} 
            className="btn-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            aria-label={`Apply for ${job.title} position`}
          >
            Apply
          </button>
        )}
        <button 
          className="text-accent hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-accent rounded"
          aria-label={`View details for ${job.title}`}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default JobCard;

