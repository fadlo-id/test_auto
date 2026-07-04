export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-md border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 text-orange-600 shadow-sm focus:ring-orange-500 focus:ring-offset-0 transition-colors ' +
                className
            }
        />
    );
}
