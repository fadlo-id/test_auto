<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticlesController extends Controller
{
    public function index(Request $request): Response
    {
        $articles = Article::with('author:id,name')
            ->when($request->search, fn ($q, $s) =>
                $q->where('title', 'like', "%$s%")->orWhere('excerpt', 'like', "%$s%")
            )
            ->when($request->status, function ($q, $s) {
                match ($s) {
                    'published'   => $q->where('is_published', true),
                    'draft'       => $q->where('is_published', false),
                    default       => null,
                };
            })
            ->when($request->category, fn ($q, $c) => $q->where('category', $c))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/News', [
            'articles' => $articles,
            'filters'  => $request->only(['search', 'status', 'category']),
            'stats'    => [
                'total'     => Article::count(),
                'published' => Article::where('is_published', true)->count(),
                'drafts'    => Article::where('is_published', false)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'excerpt'      => 'nullable|string|max:500',
            'content'      => 'required|string',
            'image_url'    => 'nullable|url|max:500',
            'category'     => 'required|string|in:news,guide,promo,update',
            'is_published' => 'boolean',
        ]);

        $data['author_id']    = auth()->id();
        $data['slug']         = Str::slug($data['title']) . '-' . Str::random(4);
        $data['published_at'] = ($data['is_published'] ?? false) ? now() : null;

        Article::create($data);

        return back()->with('success', "Article «{$data['title']}» créé.");
    }

    public function update(Request $request, Article $article): RedirectResponse
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'excerpt'      => 'nullable|string|max:500',
            'content'      => 'required|string',
            'image_url'    => 'nullable|url|max:500',
            'category'     => 'required|string|in:news,guide,promo,update',
            'is_published' => 'boolean',
        ]);

        if (($data['is_published'] ?? false) && ! $article->is_published) {
            $data['published_at'] = now();
        } elseif (! ($data['is_published'] ?? false)) {
            $data['published_at'] = null;
        }

        $article->update($data);

        return back()->with('success', "Article «{$article->title}» mis à jour.");
    }

    public function destroy(Article $article): RedirectResponse
    {
        $title = $article->title;
        $article->delete();

        return back()->with('success', "Article «{$title}» supprimé.");
    }

    public function togglePublish(Article $article): RedirectResponse
    {
        $article->update([
            'is_published' => ! $article->is_published,
            'published_at' => ! $article->is_published ? now() : null,
        ]);

        $state = $article->is_published ? 'publié' : 'dépublié';
        return back()->with('success', "Article «{$article->title}» $state.");
    }
}
