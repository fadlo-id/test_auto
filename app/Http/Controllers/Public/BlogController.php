<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Services\SeoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Article::where('is_published', true)
            ->where('published_at', '<=', now())
            ->orderByDesc('published_at');

        if ($category = $request->string('category')->trim()->toString()) {
            $query->where('category', $category);
        }

        $articles = $query->paginate(9)->withQueryString();

        $categories = Article::where('is_published', true)
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('Blog/Index', [
            'articles'   => $articles,
            'categories' => $categories,
            'filters'    => $request->only('category'),
            'seo'        => app(SeoService::class)->blogIndex($articles->total()),
        ]);
    }

    public function show(string $slug): Response
    {
        $article = Article::where('slug', $slug)
            ->where('is_published', true)
            ->where('published_at', '<=', now())
            ->with('author:id,name')
            ->firstOrFail();

        $related = Article::where('is_published', true)
            ->where('published_at', '<=', now())
            ->where('id', '!=', $article->id)
            ->where('category', $article->category)
            ->orderByDesc('published_at')
            ->take(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'image_url', 'category', 'published_at']);

        return Inertia::render('Blog/Show', [
            'article' => $article,
            'related' => $related,
            'seo'     => app(SeoService::class)->article($article),
        ]);
    }
}
