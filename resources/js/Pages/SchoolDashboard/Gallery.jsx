import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import SchoolLayout from '@/Layouts/SchoolLayout';

export default function Gallery({ school, photos: initialPhotos }) {
    const { flash } = usePage().props;
    const fileRef   = useRef(null);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);

    const onFileChange = (e) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const urls = files.map(f => URL.createObjectURL(f));
        setPreviews(urls);
    };

    const upload = () => {
        if (!fileRef.current?.files?.length) return;
        const form = new FormData();
        Array.from(fileRef.current.files).forEach(f => form.append('photos[]', f));
        setUploading(true);
        router.post(route('school.gallery.store'), form, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => { setPreviews([]); if (fileRef.current) fileRef.current.value = ''; setUploading(false); },
            onError:   () => setUploading(false),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cette photo ?')) {
            router.delete(route('school.gallery.destroy', id), { preserveScroll: true });
        }
    };

    const remaining = Math.max(0, 12 - initialPhotos.length);

    return (
        <SchoolLayout title="Galerie photos" school={school}>
            <Head title="Galerie" />

            {flash?.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{flash.success}</div>}
            {flash?.error   && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{flash.error}</div>}

            {/* Upload zone */}
            {remaining > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-1">Ajouter des photos</h3>
                    <p className="text-xs text-gray-400 mb-4">Formats : JPEG, PNG, WebP — max 5 Mo par photo — {remaining} emplacement(s) restant(s)</p>

                    <div
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                        <p className="text-3xl mb-2">📷</p>
                        <p className="text-sm font-medium text-gray-700">Cliquez pour choisir des photos</p>
                        <p className="text-xs text-gray-400 mt-1">Jusqu'à {remaining} photo(s)</p>
                        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
                            className="hidden" onChange={onFileChange} />
                    </div>

                    {previews.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">{previews.length} photo(s) sélectionnée(s)</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {previews.map((url, i) => (
                                    <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                ))}
                            </div>
                            <button onClick={upload} disabled={uploading}
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
                                {uploading ? 'Envoi en cours...' : 'Télécharger les photos'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Gallery grid */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Photos de la galerie ({initialPhotos.length}/12)</h3>
                </div>

                {initialPhotos.length > 0 ? (
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {initialPhotos.map(photo => (
                            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={`/storage/${photo.path}`}
                                    alt={photo.caption ?? ''}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button onClick={() => destroy(photo.id)}
                                        aria-label="Supprimer la photo"
                                        className="bg-white text-red-600 rounded-full w-9 h-9 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors shadow-lg">
                                        🗑
                                    </button>
                                </div>
                                {photo.caption && (
                                    <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                                        {photo.caption}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center text-gray-400">
                        <p className="text-4xl mb-3">📷</p>
                        <p className="text-sm font-medium">Aucune photo dans la galerie</p>
                        <p className="text-xs mt-1">Ajoutez des photos pour attirer plus de candidats</p>
                    </div>
                )}
            </div>
        </SchoolLayout>
    );
}
