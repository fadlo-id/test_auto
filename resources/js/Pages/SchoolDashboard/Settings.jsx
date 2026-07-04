import { Head, router, useForm, usePage } from '@inertiajs/react';
import SchoolLayout from '@/Layouts/SchoolLayout';

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {children}
        </div>
    );
}

function Input({ type = 'text', ...props }) {
    return (
        <input type={type} {...props}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
    );
}

export default function Settings({ school, categories }) {
    const { flash } = usePage().props;

    const { data, setData, put, post, processing, errors } = useForm(
        school
            ? {
                name: school.name ?? '',
                description: school.description ?? '',
                email: school.email ?? '',
                phone: school.phone ?? '',
                address: school.address ?? '',
                city: school.city ?? '',
                region: school.region ?? '',
                website_url: school.website_url ?? '',
                facebook_url: school.facebook_url ?? '',
                instagram_url: school.instagram_url ?? '',
                latitude: school.latitude ?? '',
                longitude: school.longitude ?? '',
                categories: school.categories?.map((c) => c.id) ?? [],
            }
            : {
                name: '', description: '', email: '', phone: '', address: '', city: '',
                region: '', license_number: '', established_year: '', website_url: '',
                facebook_url: '', instagram_url: '', latitude: '', longitude: '', categories: [],
            }
    );

    const submit = (e) => {
        e.preventDefault();
        if (school) {
            put(route('school.settings.update'), { preserveScroll: true });
        } else {
            post(route('school.settings.store'));
        }
    };

    const toggleCategory = (id) => {
        const current = data.categories;
        setData('categories', current.includes(id) ? current.filter((c) => c !== id) : [...current, id]);
    };

    return (
        <SchoolLayout title="Parametres" school={school}>
            <Head title="Parametres" />

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>
            )}
            {flash?.error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>
            )}

            {!school && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-sm">
                    Bienvenue ! Completez le formulaire ci-dessous pour creer votre auto-ecole.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                {/* Basic info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Informations generales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Nom de l'auto-ecole *">
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </Field>
                        <Field label="Email *">
                            <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </Field>
                        <Field label="Telephone *">
                            <Input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} required />
                        </Field>
                        {!school && (
                            <Field label="Numero de licence *">
                                <Input value={data.license_number ?? ''} onChange={(e) => setData('license_number', e.target.value)} required />
                            </Field>
                        )}
                        <div className="sm:col-span-2">
                            <Field label="Description">
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Localisation</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Adresse *">
                            <Input value={data.address} onChange={(e) => setData('address', e.target.value)} required />
                        </Field>
                        <Field label="Ville *">
                            <Input value={data.city} onChange={(e) => setData('city', e.target.value)} required />
                        </Field>
                        <Field label="Region">
                            <Input value={data.region} onChange={(e) => setData('region', e.target.value)} />
                        </Field>
                        <div />
                        <Field label="Latitude">
                            <Input type="number" step="any" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} placeholder="-90 a 90" />
                        </Field>
                        <Field label="Longitude">
                            <Input type="number" step="any" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} placeholder="-180 a 180" />
                        </Field>
                    </div>
                </div>

                {/* Social */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Liens externes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Site web">
                            <Input type="url" value={data.website_url} onChange={(e) => setData('website_url', e.target.value)} placeholder="https://" />
                        </Field>
                        <Field label="Facebook">
                            <Input type="url" value={data.facebook_url} onChange={(e) => setData('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
                        </Field>
                        <Field label="Instagram">
                            <Input type="url" value={data.instagram_url} onChange={(e) => setData('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
                        </Field>
                    </div>
                </div>

                {/* Categories */}
                {categories?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Categories de formations</h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                        data.categories.includes(cat.id)
                                            ? 'bg-orange-600 text-white border-orange-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                                    }`}
                                >
                                    {cat.name_fr ?? cat.code}
                                </button>
                            ))}
                        </div>
                        {errors.categories && <p className="text-red-500 text-xs mt-2">{errors.categories}</p>}
                    </div>
                )}

                <div className="flex justify-end">
                    <button type="submit" disabled={processing}
                        className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50">
                        {processing ? 'Enregistrement...' : school ? 'Sauvegarder les modifications' : 'Creer mon auto-ecole'}
                    </button>
                </div>
            </form>
        </SchoolLayout>
    );
}
