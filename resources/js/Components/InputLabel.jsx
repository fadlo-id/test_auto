export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label {...props} className={`block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 ` + className}>
            {value ?? children}
        </label>
    );
}
