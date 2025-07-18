// src/components/LinkSnapLoader - LinkSnapLoader spinner component

type LinkSnapLoaderProps = {
  message?: string;
};

const LinkSnapLoader = ({ message = "Loading your dashboard..." }: LinkSnapLoaderProps) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="mb-4">
      <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent select-none">
        LinkSnap
      </span>
    </div>
    <div className="relative w-16 h-16">
      <svg className="animate-spin text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
    <div className="mt-4 text-lg text-gray-600">{message}</div>
  </div>
);

export default LinkSnapLoader; 