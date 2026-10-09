<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\Formation;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FormationManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->admin()->create());
    }

    public function test_admin_can_create_a_formation_with_an_image(): void
    {
        Storage::fake('public');

        $response = $this->postJson('/api/admin/formations', [
            'title' => 'Laravel',
            'description' => 'Formation Laravel',
            'level' => 'beginner',
            'is_published' => true,
            'image' => UploadedFile::fake()->image('laravel.png'),
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.slug', 'laravel')
            ->assertJsonPath('data.code', 'LAR');

        Storage::disk('public')->assertExists(Formation::first()->image_path);
    }

    public function test_admin_can_update_and_delete_a_formation(): void
    {
        $formation = Formation::factory()->create();

        $this->putJson("/api/admin/formations/{$formation->id}", [
            'title' => 'React',
            'slug' => 'react',
            'level' => 'intermediate',
            'is_published' => false,
        ])->assertOk()->assertJsonPath('data.title', 'React')->assertJsonPath('data.is_published', false);

        $this->deleteJson("/api/admin/formations/{$formation->id}")->assertNoContent();

        $this->assertModelMissing($formation);
    }

    public function test_admin_can_manage_modules(): void
    {
        $formation = Formation::factory()->create();

        $this->postJson("/api/admin/formations/{$formation->id}/modules", ['number' => 1, 'title' => 'Introduction à Laravel'])
            ->assertCreated();

        $this->postJson("/api/admin/formations/{$formation->id}/modules", ['number' => 1, 'title' => 'Doublon'])
            ->assertJsonValidationErrors('number');

        $module = $formation->modules()->first();

        $this->putJson("/api/admin/modules/{$module->id}", ['number' => 2, 'title' => 'Installation'])
            ->assertOk()
            ->assertJsonPath('data.number', 2);

        $this->getJson("/api/admin/formations/{$formation->id}/modules")->assertOk()->assertJsonCount(1, 'data');

        $this->deleteJson("/api/admin/modules/{$module->id}")->assertNoContent();
    }

    public function test_admin_can_manage_courses_with_a_pdf(): void
    {
        Storage::fake('public');
        $module = Module::factory()->create();

        $response = $this->postJson("/api/admin/modules/{$module->id}/courses", [
            'title' => 'Les routes',
            'description' => 'Découverte des routes',
            'content' => 'Contenu du cours',
            'video_url' => 'https://www.youtube.com/watch?v=abc',
            'pdf' => UploadedFile::fake()->create('routes.pdf', 100, 'application/pdf'),
            'duration_minutes' => 15,
            'position' => 1,
        ]);

        $response->assertCreated()->assertJsonPath('data.duration_minutes', 15);
        $course = Course::first();
        Storage::disk('public')->assertExists($course->pdf_path);

        $this->putJson("/api/admin/courses/{$course->id}", [
            'title' => 'Les routes (v2)',
            'position' => 2,
            'remove_pdf' => true,
        ])->assertOk()->assertJsonPath('data.pdf_url', null);

        Storage::disk('public')->assertMissing($course->pdf_path);

        $this->deleteJson("/api/admin/courses/{$course->id}")->assertNoContent();
    }
}
