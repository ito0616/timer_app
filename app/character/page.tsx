import CharacterView from "@/components/Character/CharacterView";

export default function CharacterPage() {
    return (
        <div className="min-h-screen p-6">
            <h2 className="text-xl font-black gradient-text mb-6 text-center">キャラクター</h2>
            <CharacterView />
        </div>
    );
}
