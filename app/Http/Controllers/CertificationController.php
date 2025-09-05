<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use App\Models\UserCertification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificationController extends Controller
{
    /**
     * Mostrar todas las certificaciones disponibles
     */
    public function index(Request $request): Response
    {
        $certifications = Certification::active()
            ->withCount('successfulCertifications')
            ->orderBy('name')
            ->paginate(12);

        $userCertifications = [];
        if ($request->user()) {
            $userCertifications = UserCertification::where('user_id', $request->user()->id)
                ->pluck('certification_id')
                ->toArray();
        }

        return Inertia::render('Certifications/Index', [
            'certifications' => $certifications,
            'userCertifications' => $userCertifications,
            'filters' => [
                'search' => $request->get('search', ''),
                'category' => $request->get('category', ''),
                'level' => $request->get('level', ''),
                'price_range' => $request->get('price_range', ''),
                'user_status' => $request->get('user_status', ''),
            ],
            'stats' => [
                'total' => $certifications->count(),
                'categories' => $certifications->pluck('category')->unique()->count(),
                'levels' => $certifications->pluck('level')->unique()->count(),
            ],
            'categories' => $certifications->pluck('category')->unique()->mapWithKeys(function ($category) {
                return [$category => ucfirst(str_replace('_', ' ', $category))];
            }),
            'levels' => [
                'beginner' => 'Principiante',
                'intermediate' => 'Intermedio',
                'advanced' => 'Avanzado',
                'expert' => 'Experto',
            ],
        ]);
    }

    /**
     * Mostrar una certificación específica
     */
    public function show(Certification $certification): Response
    {
        $certification->loadCount('successfulCertifications');
        
        return Inertia::render('Certifications/Show', [
            'certification' => $certification
        ]);
    }
}