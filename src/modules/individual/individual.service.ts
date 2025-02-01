import { Injectable } from '@nestjs/common';
import { InjectBaseRepository } from '@libs/decorators/inject-base-repository.decorator';
import { Individual } from './entities/individual.entity';
import { BaseRepository } from '@libs/types/base-repository';
import { PaginatorInput } from '../../libs/application/paginator/paginator.input';
import { FilterIndividualsInput } from './dtos/inputs/filter-individual.input';
import { dataSource } from '../../configs/database/postgres.config';
import { ErrorCodeEnum } from '../../libs/application/exceptions/error-code.enum';
import { User } from '../user/entities/user.entity';
import { UpdateIndividualInput } from './dtos/inputs/update-individual.input';
import { IndividualTransformer } from './transformer/individual.transformer';

@Injectable()
export class IndividualService {
  constructor(
    @InjectBaseRepository(Individual)
    private readonly individualRepo: BaseRepository<Individual>,

    private individualTransformer: IndividualTransformer,
  ) {}

  async searchIndividuals(
    jobFilterInput: FilterIndividualsInput,
    { page, limit }: PaginatorInput,
  ) {
    const { individualCategory, searchKey } = jobFilterInput;

    const searchConfig = 'english';
    const jobSearchVector = 'individual.individualSearchVector';

    let modifiedSearchTerm = '';
    if (searchKey) {
      const words = searchKey.split(/\s+/);
      const similarWords = [];
      const defaultThreshold = 0.3;
      const thresholdDecrement = 0.05;

      for (const word of words) {
        let threshold = defaultThreshold;
        let result: any[] = [];

        do {
          result = await dataSource
            .createQueryBuilder()
            .select('lexeme.word, similarity(lexeme.word, :word) AS similarity')
            .from('individual_unique_words', 'lexeme')
            .where('similarity(lexeme.word, :word) > :threshold', {
              word,
              threshold,
            })
            .orderBy('similarity', 'DESC')
            .limit(5)
            .getRawMany();

          if (words.length === 1 && result.length === 0) {
            threshold -= thresholdDecrement;
          }
        } while (words.length === 1 && result.length === 0 && threshold >= 0);

        if (result.length > 0) {
          const topWords =
            result[0].similarity > 0.5 ? result.slice(0, 1) : result;
          similarWords.push(topWords);
        }
      }

      modifiedSearchTerm = similarWords
        .map(
          (wordGroup) =>
            `(${wordGroup.map((word: any) => word.word).join(' | ')})`,
        )
        .join(' & ');

      modifiedSearchTerm = modifiedSearchTerm.replace(/[:/]/g, '');
    }

    const roleFieldsMap = {
      MODEL: `
        'hips', model."hips",
        'bust', model."bust",
        'waist', model."waist",
        'height', model."height",
        'gender', model."gender",
        'weight', model."weight",
        'shoeSize', model."shoeSize",
        'dressSize', model."dressSize",
        'birthDate', model."birthDate",
        'nationality', model."nationality",
        'eyeColorEnum', model."eyeColorEnum",
        'skinToneEnum', model."skinToneEnum",
        'hairColorEnum', model."hairColorEnum"
      `,
      EDITOR: `
        'editingSoftware', editor."editingSoftware",
        'colorGrading', editor."colorGrading",
        'soundEditing', editor."soundEditing",
        'visualEffects', editor."visualEffects",
        'motionGraphics', editor."motionGraphics"
      `,
      PHOTOGRAPHER: `
        'camera', photographer."camera",
        'lightning', photographer."lightning",
        'lense', photographer."lense"
      `,
      VIDEOGRAPHER: `
        'camera', videographer."camera",
        'lightning', videographer."lightning",
        'lense', videographer."lense",
        'stabilizer', videographer."stabilizer"
      `,
    };

    const caseExpression = Object.entries(roleFieldsMap)
      .map(
        ([role, fields]) => `
        WHEN individual.role = '${role}' THEN 
          jsonb_build_object(${fields})
      `,
      )
      .join(' ');

    const queryBuilder = dataSource
      .createQueryBuilder()
      .select([
        'individual.id AS id',
        'individual.firstName AS "firstName"',
        'individual.lastName AS "lastName"',
        'individual.bio AS bio',
        'individual.role AS "role"',
      ])
      .addSelect(
        `CASE 
          ${caseExpression}
          ELSE NULL
        END`,
        'specialtyInfo',
      )
      .from('individual', 'individual')
      .leftJoin('individual.model', 'model')
      .leftJoin('individual.editor', 'editor')
      .leftJoin('individual.photographer', 'photographer')
      .leftJoin('individual.videographer', 'videographer')
      .andWhere('individual.role = :role', { role: individualCategory })
      .andWhere('individual.isVisible = true');

    if (searchKey) {
      queryBuilder.andWhere(
        `${jobSearchVector} @@ to_tsquery(:searchConfig, :searchTerm)`,
        { searchTerm: modifiedSearchTerm, searchConfig },
      );
    } else {
      queryBuilder.orderBy('RANDOM()');
    }

    const skip = (page - 1) * limit;
    const total = await queryBuilder.getCount();
    const items = await queryBuilder.skip(skip).take(limit).getRawMany();

    return {
      items,
      pageInfo: {
        page,
        limit,
        hasBefore: page > 1,
        hasNext: skip + items.length < total,
        totalCount: total,
      },
    };
  }

  async getIndividual(id: string) {
    const individual = await this.individualRepo.findOneOrError(
      { id, isVisible: true },
      ErrorCodeEnum.INDIVIDUAL_DOES_NOT_EXIST,
      {
        model: true,
        editor: true,
        videographer: true,
        photographer: true,
      },
    );

    return { ...individual, id: individual.userId };
  }

  async updateIndividual(user: User, input: UpdateIndividualInput) {
    const individual = await this.individualRepo.findOneOrError(
      { userId: user.id },
      ErrorCodeEnum.NOT_FOUND,
      { model: true, editor: true, videographer: true, photographer: true },
    );

    if (input.specialtyInfo) {
      await this.individualTransformer.updateIndividualSpecialty(
        individual,
        input.specialtyInfo,
      );
      delete input.specialtyInfo;
    }

    if (input?.accountInfo) {
      const { firstName, lastName } = individual;

      input['lastName'] ??= input.accountInfo.lastName ?? lastName;
      input['firstName'] ??= input.accountInfo.firstName ?? firstName;
    }

    await this.individualRepo.updateOneFromExistingModel(individual, input);
    return await this.individualRepo.findOne({ id: individual.id });
  }
}
