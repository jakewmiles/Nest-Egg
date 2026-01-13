import AccountDetailPageClient from './AccountDetailPage';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function AccountDetailPage() {
  return <AccountDetailPageClient />;
}
