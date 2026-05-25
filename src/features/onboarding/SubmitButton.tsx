interface Props {
  loading: boolean;
}

export const SubmitButton = ({ loading }: Props) => (
  <button type="submit" disabled={loading}
    className="w-full h-12 bg-dark text-white font-semibold text-sm hover:bg-dark/85 active:scale-95 transition-all duration-200 tracking-wide mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
  >
    {loading ? 'Saving…' : 'Start Planning ❆'}
  </button>
);
